import Hero from "@/components/hero";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <meta name='robots' content='index' />
      </Head>
      <Hero />
    </>
  );
}
