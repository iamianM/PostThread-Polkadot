import React, { useState } from "react";
import Image from "next/image";
import Login from "./LoginForm";

export default function Modal() {

    const [showModal, setShowModal] = useState(false);

    return (
        <div className="flex md:flex-col justify-center items-center mt-40 ">
            <div className="flex gap-5 ">
                <button
                    className="bg-blue-600 text-white active:bg-black hover:bg-black flex justify-center items-center gap-2
      font-bold px-6 h-12 rounded-md shadow hover:shadow-lg outline-none focus:outline-none"
                    type="button"
                    onClick={() => setShowModal(true)}
                >
                    Open First Modal
                </button>

            </div>
            {showModal ? (
                <Login />
            ) : null}
        </div>
    );
};

