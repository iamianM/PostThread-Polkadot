#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/v3/runtime/frame>
pub use pallet::*;

// #[cfg(test)]
// mod mock;

// #[cfg(test)]
// mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::{pallet_prelude::*, ensure, Twox64Concat, BoundedVec};
	use frame_system::{pallet_prelude::*, ensure_signed};

	/// add access to the interface
	use frame_support::traits::{Currency};

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
		type MaxPosts: Get<u32>;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	// Create a type alias for getting balance from currency
	type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	// #[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen, Copy)]
	// pub struct Ninja<Account, Balance> {
	// 	pub dna: [u8; 16],
	// 	pub price: Option<Balance>,
	// 	pub attribute: NinjaAttribute,
	// 	pub owner: Account,
	// }

	// The pallet's runtime storage items.
	// https://docs.substrate.io/v3/runtime/storage
	#[pallet::storage]
	pub(super) type CountForNinjas<T: Config> = StorageValue<_, u64, ValueQuery>;

	#[pallet::storage]
	pub(super) type NominatedPosts<T: Config> = StorageValue<
		_,
		BoundedVec<[u8; 16], T::MaxPosts>,
		ValueQuery,
	>;

	#[pallet::storage]
	pub(super) type VoteCount<T: Config> = StorageMap<_, Twox64Concat, u8, u64>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		Created { ninja: [u8; 16], owner: T::AccountId },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		StorageOverflow,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
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
	}

	// Pallet internal function
	impl<T: Config> Pallet<T> {
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
			Ok(())
		}
	}
}
