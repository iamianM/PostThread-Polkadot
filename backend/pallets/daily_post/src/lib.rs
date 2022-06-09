#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/v3/runtime/frame>
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::{pallet_prelude::*, ensure, Twox64Concat, BoundedVec};
	use frame_system::{pallet_prelude::*, ensure_signed};

	/// add access to the interface
	use frame_support::traits::{Currency, Randomness};

	/// Configure the pallet by specifying the parameters and types on which it depends.
	/// Pallet configuration trait, representing custom external types and interfaces
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		/// Add a currency trait so I can handle currency for my ninja pallet
		type Currency: Currency<Self::AccountId>;

		/// Maximum amount of ninja ownable
		#[pallet::constant]
		type MaxNinjaOwned: Get<u32>;

		/// randomness type to specify
		type NinjaRandomness: Randomness<Self::Hash, Self::BlockNumber>;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	// Create a type alias for getting balance from currency
	type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	/// The type of ninja gotten
	#[derive(Clone, Encode, Decode, PartialEq, Copy, RuntimeDebug, TypeInfo, MaxEncodedLen)]
	pub enum NinjaAttribute {
		Wind,
		Fire,
		Water,
	}

	#[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen, Copy)]
	pub struct Ninja<Account, Balance> {
		pub dna: [u8; 16],
		pub price: Option<Balance>,
		pub attribute: NinjaAttribute,
		pub owner: Account,
	}

	// The pallet's runtime storage items.
	// https://docs.substrate.io/v3/runtime/storage
	#[pallet::storage]
	pub(super) type CountForNinjas<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	pub(super) type MaxDailyNominations<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	pub(super) type Ninjas<T: Config> = StorageMap<_, Twox64Concat, [u8; 16], Ninja<T::AccountId, BalanceOf<T>>>;

	#[pallet::storage]
	pub(super) type NominatedPosts<T: Config> = StorageValue<
		_,
		BoundedVec<[u8; 16], T::MaxNinjaOwned>,
		ValueQuery,
	>;

	#[pallet::storage]
	pub(super) type VoteCount<T: Config> = StorageMap<_, Twox64Concat, u8, u64>;

	#[pallet::storage]
	pub(super) type NinjasOwned<T: Config> = StorageMap<
		_,
		Twox64Concat,
		T::AccountId,
		BoundedVec<[u8; 16],
		T::MaxNinjaOwned>,
		ValueQuery
	>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		Created { ninja: [u8; 16], owner: T::AccountId },
		Transferred { from: T::AccountId, to: T::AccountId, ninja: [u8; 16] },
		PriceSet { ninja: [u8; 16], price: Option<BalanceOf<T>> },
		Purchased { ninja: [u8; 16], buyer: T::AccountId, seller: T::AccountId, price: BalanceOf<T> },
		Nominated { post: [u8; 16], by: T::AccountId, count: u128 },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		NominationLimitReached,
		NominationClosed,
		TooManyOwned,
		DuplicateNinja,
		StorageOverflow,
		NoNinja,
		NotOwner,
		TransferToSelf,
		BidPriceTooLow,
		NotForSale
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// create ninja and assign to caller
		#[pallet::weight(0)]
		pub fn create_ninja(origin: OriginFor<T>) -> DispatchResult {
			// Make sure caller is from a signed origin
			let sender = ensure_signed(origin).map_err(|_| "Invalid Signer")?;

			let (ninja_dna, attribute) = Self::gen_dna();

			Self::mint(sender, ninja_dna, attribute)?;

			Ok(())
		}

		// add a new post to the list on nominations
		// max in list is 15
		// nominations should not already exist
		#[pallet::weight(0)]
		pub fn nominate_post(
			origin: OriginFor<T>,
			nominated: [u8; 16]
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;
			let posts = NominatedPosts::<T>::get();

			let is_exists = posts.contains(&nominated);

			if is_exists {
				Self::update_nomination(nominated, sender)?;
			} else {
				Self::add_to_nomination(nominated, sender)?;
			}

			Ok(())
		}

		#[pallet::weight(100)]
		pub fn transfer_ninja(
			origin: OriginFor<T>,
			to: T::AccountId,
			ninja_id: [u8; 16]
		) -> DispatchResult {
			let from = ensure_signed(origin)?;
			let ninja = Ninjas::<T>::get(&ninja_id).ok_or(Error::<T>::NoNinja)?;

			ensure!(ninja.owner == from, Error::<T>::NotOwner);
			Self::do_transfer(ninja_id, to)?;

			Ok(())
		}

		#[pallet::weight(1)]
		pub fn set_price(
			origin: OriginFor<T>,
			ninja_id: [u8; 16],
			new_price: Option<BalanceOf<T>>,
		) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			let mut ninja = Ninjas::<T>::get(&ninja_id).ok_or(Error::<T>::NoNinja)?;
			ensure!(ninja.owner == sender, Error::<T>::NotOwner);

			ninja.price = new_price;
			Ninjas::<T>::insert(ninja_id, ninja);

			Self::deposit_event(Event::PriceSet { ninja: ninja_id, price: new_price });
			Ok(())
		}

		#[pallet::weight(0)]
		pub fn buy_ninja(
			origin: OriginFor<T>,
			ninja_id: [u8; 16],
			bid_price: BalanceOf<T>
		) -> DispatchResult {
			let buyer = ensure_signed(origin)?;

			Self::handle_buy_ninja(ninja_id, buyer, bid_price)?;

			Ok(())
		}

		// #[pallet::weight(10)]
		// pub fn update_base_uri(
		// 	origin: OriginFor<T>,
		// 	uri: str,
		// ) -> DispatchResult {
		// 	let sender = ensure_signed(origin)?;
		// }
	}

	// Pallet internal function
	impl<T: Config> Pallet<T> {
		fn gen_dna() -> ([u8; 16], NinjaAttribute) {
			// create randomness
			let random = T::NinjaRandomness::random(&b"dna"[..]).0;

			// create randomness payload
			let unique_payload = (
				random,
				frame_system::Pallet::<T>::extrinsic_index().unwrap_or_default(),
				frame_system::Pallet::<T>::block_number(),
			);

			// convert payload to byte array [u8; 16]
			let encoded_payload = unique_payload.encode();
			let hash = frame_support::Hashable::blake2_128(&encoded_payload);

			// generate attribute
			if hash[0] % 2 == 0 {
				(hash, NinjaAttribute::Water)
			} else if hash[0] % 3 == 0 {
				(hash, NinjaAttribute::Fire)
			} else {
				(hash, NinjaAttribute::Wind)
			}
		}

		fn update_nomination(
			post: [u8; 16],
			sender: T::AccountId,
		) -> DispatchResult {
			Ok(())
		}

		fn add_to_nomination(
			post: [u8; 16],
			sender: T::AccountId,
		) -> DispatchResult {
			let max_post = MaxDailyNominations::<T>::get();
			let mut all_posts = NominatedPosts::<T>::get();

			ensure!(all_posts.len() <= max_post.try_into().unwrap(), Error::<T>::NominationLimitReached);

			all_posts.try_push(post).map_err(|()| Error::<T>::NominationLimitReached)?;

			let count = all_posts.len();
			NominatedPosts::<T>::put(all_posts);

			Self::deposit_event(Event::Nominated { post, by: sender, count: count as u128 });
			Ok(())
		}

		fn mint(
			owner: T::AccountId,
			dna: [u8; 16],
			attribute: NinjaAttribute
		) -> Result<[u8; 16], DispatchError> {
			let ninja = Ninja::<T::AccountId, BalanceOf<T>> {
				dna,
				price: None,
				attribute,
				owner: owner.clone(),
			};

			ensure!(!Ninjas::<T>::contains_key(&ninja.dna), Error::<T>::DuplicateNinja);

			let count = CountForNinjas::<T>::get();
			let new_count = count.checked_add(1).ok_or(Error::<T>::StorageOverflow);

			NinjasOwned::<T>::try_append(&ninja.owner, ninja.dna)
				.map_err(|_| Error::<T>::TooManyOwned)?;

			Ninjas::<T>::insert(&ninja.dna, &ninja);
			CountForNinjas::<T>::put(new_count.unwrap());

			Self::deposit_event(Event::Created { ninja: dna, owner: owner.clone() });

			Ok(dna)
		}

		fn do_transfer(ninja_id: [u8; 16], to: T::AccountId) -> DispatchResult {
			let mut ninja = Ninjas::<T>::get(&ninja_id).ok_or(Error::<T>::NoNinja)?;
			let from = ninja.owner;

			ensure!(from != to, Error::<T>::TransferToSelf);
			let mut from_owned = NinjasOwned::<T>::get(&from);

			if let Some(ind) = from_owned.iter().position(|&id| id == ninja_id) {
				from_owned.swap_remove(ind);
			} else {
				return Err(Error::<T>::NoNinja.into())
			}

			let mut to_owned = NinjasOwned::<T>::get(&to);
			to_owned.try_push(ninja_id).map_err(|()| Error::<T>::TooManyOwned)?;

			ninja.owner = to.clone();
			ninja.price = None;

			Ninjas::<T>::insert(&ninja_id, ninja);
			NinjasOwned::<T>::insert(&to, to_owned);
			NinjasOwned::<T>::insert(&from, from_owned);

			Self::deposit_event(Event::Transferred { from, to, ninja: ninja_id });

			Ok(())
		}

		fn handle_buy_ninja(
			ninja_id: [u8; 16],
			buyer: T::AccountId,
			bid_price: BalanceOf<T>
		) -> DispatchResult {
			let mut ninja = Ninjas::<T>::get(&ninja_id).ok_or(Error::<T>::NoNinja)?;
			let from = ninja.owner;

			ensure!(buyer != from, Error::<T>::TransferToSelf);
			let mut from_owned = NinjasOwned::<T>::get(&from);

			if let Some(ind) = from_owned.iter().position(|&id| id == ninja_id) {
				from_owned.swap_remove(ind);
			} else {
				return Err(Error::<T>::NoNinja.into())
			}

			let mut to_owned = NinjasOwned::<T>::get(&buyer);
			to_owned.try_push(ninja_id).map_err(|()| Error::<T>::TooManyOwned)?;

			if let Some(price) = ninja.price {
				ensure!(bid_price >= price, Error::<T>::BidPriceTooLow);
				T::Currency::transfer(
					&buyer,
					&from,
					price,
					frame_support::traits::ExistenceRequirement::KeepAlive
				)?;

				Self::deposit_event(Event::Purchased {
					ninja: ninja_id, buyer: from.clone(), seller: buyer.clone(), price
				})
			} else {
				return Err(Error::<T>::NotForSale.into())
			}

			ninja.owner = buyer.clone();
			ninja.price = None;

			Ninjas::<T>::insert(&ninja_id, &ninja);
			NinjasOwned::<T>::insert(&buyer, to_owned);
			NinjasOwned::<T>::insert(&from, from_owned);

			Self::deposit_event(Event::Transferred { from, to: buyer, ninja: ninja_id });

			Ok(())
		}
	}
}
