import React from 'react'

export default function ThemeSelector() {
    return (
        <div class="m-5">
            <select data-choose-theme class="focus:outline-none h-10 rounded-full px-3 border">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="halloween">Halloween</option>
                <option value="bumblebee">bumblebee</option>
                <option value="emerald">emerald</option>
                <option value="corporate">corporate</option>
                <option value="synthwave">synthwave</option>
                <option value="retro">retro</option>
                <option value="cyberpunk">cyberpunk</option>
                <option value="forest">forest</option>
                <option value="aqua">aqua</option>
                <option value="lofi">lofi</option>
                <option value="fantasy">fantasy</option>
                <option value="dracula">dracula</option>
                <option value="coffee">coffee</option>
            </select>
        </div>
    )
}
