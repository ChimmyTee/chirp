import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
// import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// You use extend to add the plugin
dayjs.extend(relativeTime);

import { type RouterOutputs, api } from "~/utils/api";


// This right here is a component
const CreatePostWizard = () => {
  const { user } = useUser();

  console.log(user);
  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} alt="Profile Image"
        className="w-16 h-16"
        width={56}
        height={56}
      />
      <input placeholder="Type something" className="bg-transparent grow" />
    </div>
  )
};

// with tRPC, instead of putting things in the parameter, you can use the getAll query
// RouterOutputs uses the api.ts file, to create a tRPC next api definition that we fetched from.
// This is a very useful inference helper for outputs, we can get use to get 
// The [number] transform the data from an array to a single element of "number"
type PostWithUser = RouterOutputs["posts"]["getAll"][number]

// Don't make new component files just yet, until you actually really need it somewhere else.
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 p-4 border-b border-slate-400">
      <Image src={author?.profileImageUrl} alt={`@${author.username}`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <span>{author?.username}</span><span>{`- ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )
}

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const user = useUser();

  // This line has potential to do something fancy with tRPC
  // You don't want the user connecting directly to a database especially when
  // using something like Vercel. Here we use tRPC as a different server to access data.
  /* The reason we use tRPC is so we can separate the data, where the users see it on
     index.tsx and we can access via the posts.ts Routers like its on the same machine.
  */
  // This is a feature in React Query by using isLoading
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  // console.log(hello.data);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="border-x border-slate-400 w-full md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {/* inline if true(!!) statement then(&&) do that */}
            {!user.isSignedIn && <SignInButton />}

            {/* {!!user.isSignedIn && <SignOutButton />} */}
            {!!user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col">
            {/* Don't forget about the key, as React uses it to keep track of what needs to be updated. */}
            {/* {[...data!, ...data!]?.map((fullPost) => ( */}
            {data?.concat(data)?.map((fullPost) => (
              // (<div key={post.id} className="p-8 border-b border-slate-400">{post.content}</div>)
              <PostView {...fullPost} key={fullPost.post.id} />)
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
