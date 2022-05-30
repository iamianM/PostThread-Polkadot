import React from "react";
import styles from "./FrontPage.module.css";

function FrontPage() {

    return (
        
    <main className={styles.characterEditor}>
        <div className={styles.perspectiveEffect}></div>
        <header className={styles.header}>
        <h1 className={styles.title}>Create your Character</h1>
        <p className={styles.description}>
            The FrontPage of the BlockChain!
        </p>
        </header>
    </main>
    )
}