import Head from "next/head";
import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import webconfig from "website.config";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Router from "next/router"
import NProgress from "nprogress";
import { useEffect } from "react";

export default function Layout({
  children,
}: {
  children: { props: AppProps };
  }): JSX.Element {
    useEffect(() => {
      Router.events.on("routeChangeStart", () => NProgress.start());
      Router.events.on("routeChangeComplete", () => NProgress.done());
      Router.events.on("routeChangeError", () => NProgress.done());
    }, [children.props.router]);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="application-name" content="Alessio Franceschi" />
        <meta
          name="description"
          content="Alessio Franceschi's personal Blog on Programming"
        />
        <link rel="icon" href="/favicon.png" type="image/x-icon"></link>
      </Head>
      <DefaultSeo {...webconfig.SEO} />
      <Header />
      <main className="container mx-auto justify-between md:px-8 w-10/12">
        {children}
      </main>
      <Footer />
    </>
  );
}