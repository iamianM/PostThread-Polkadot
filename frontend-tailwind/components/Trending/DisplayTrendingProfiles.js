import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import TrendingProfile from './TrendingProfile';

export default function DisplayTrendingProfiles({ profiles }) {


    return (
        <div>
            {profiles?.map((profile) =>
                (<TrendingProfile key={uuidv4()} profile={profile} />))}
        </div>
    )
}
