import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Canvas_Three from "../components/Canvas_Three";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <div className="relative">
      <Head>
        <title>Hama Page</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="absolute w-screen h-screen -z-10">
        <Canvas_Three />
      </div>
      <div className="absolute container min-h-screen">
        <h1>hello</h1>
      </div>
    </div>
  );
}
