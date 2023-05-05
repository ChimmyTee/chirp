import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByID.useQuery({
    userId: "user_2NnDbTCzRBgIj18XzHxcSaaVLWH",
  });

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>404</div>

  console.log(data);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>{data.id}</div>
      </main>
    </>
  );
};

/* notice that the data is loading, we want to get this data faster.
    We do that with 
    export const getServersideProps = async (context) => {
    } 
    However, with this function it runs on every request this page is loaded.
    It gonna be slower, and it doesn't allow typing to be carried over. Especially on Vercel.
    Instead we're gonna use an SSG Helper, where we can pre-hydrate SOME data ahead of time.
    using getStaticProps, we can get it run once, and this way it's more efficient.
    SSG = Static Site Generation
    We are using the 9.x SSGHelper from tRPC a bit outdated.
*/

import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import { appRouter } from "~/server/api/root";
import { prisma } from '~/server/db';
import SuperJSON from "superjson";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  // this is where we use the SSG helper by hydrating the data.
  await ssg.profile.getUserByID.prefetch({ userId: slug });

  // then we dehydate it in here. Essentially what trpcState SSG does is, it takes all the things we
  // fetched and put it into a shape that can be parsed through next.js server-side props. In this case,
  // it's a server side static props. Because our _app.tsx is wrapped with tRPC, we actually hydate all
  // that data through react query. In simpler terms, the data is there when the page is loaded.
  // so we never have to use the isLoading state cause it will never be hit.
  return {
    props: {
      trpcState: ssg.dehydrate(),
    }
  }
}

// continue the work with getStaticPaths, if we use getStaticProps, we get a Path. 2:11:00

export default ProfilePage;
