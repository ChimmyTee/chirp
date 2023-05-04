// import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
// import Head from "next/head";
// import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import LoadingSpinner, { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime); // You use extend to add the plugin

import { type RouterOutputs, api } from "~/utils/api";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";



// This right here is a component
const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  // isLoading here is also a special query
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
      // set the post to empty when posted.
      // then we want to update the newly added post to the screen,
      // easiest way to do that is to grab the ctx of the whole trpc cache
      // api ctx call. aka ctx = api.useContext()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }

      // toast.error("Failed to post! Please try again later.");
    }
  });

  // console.log(user);
  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} alt="Profile Image"
        className="w-16 h-16"
        width={56}
        height={56}
      />
      <input
        placeholder="Type something"
        className="bg-transparent grow"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input })
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  )
};

// with tRPC, instead of putting things in the parameter, you can use the getAll query
// RouterOutputs uses the api.ts file, to create a tRPC next api definition that we fetched from.
// This is a very useful inference helper for outputs, we can get use to get 
// The [number] transform the data from an array to a single element of "number"
type PostWithUser = RouterOutputs["posts"]["getAll"][number]

// Don't make new component files just yet, until you actually really need it somewhere else.
// Single post
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
          <Link href={`/@${author.username}`}>
            <span>{author?.username}</span>
          </Link>
          <Link href={`/post/@${post.id}`}>
            <span>{`- ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  )
}

// Main feed component
const Feed = () => {
  // isLoading is a feature in React Query
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  // if (postsLoading || true) return <LoadingPage />; always return true to simulate what the loading is like.
  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {/* Don't forget about the key, as React uses it to keep track of what needs to be updated. */}
      {/* {[...data!, ...data!]?.map((fullPost) => ( */}
      {data?.map((fullPost) => (
        // (<div key={post.id} className="p-8 border-b border-slate-400">{post.content}</div>)
        <PostView {...fullPost} key={fullPost.post.id} />)
      )}
    </div>
  )

}

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  // isLoaded is a property of useUser() from Clerk
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // This line has potential to do something fancy with tRPC
  // You don't want the user connecting directly to a database especially when
  // using something like Vercel. Here we use tRPC as a different server to access data.
  /* The reason we use tRPC is so we can separate the data, where the users see it on
     index.tsx and we can access via the posts.ts Routers like its on the same machine.
  */
  // Start fetching ASAP
  api.posts.getAll.useQuery();

  // Return empty div if BOTH aren't loaded, since user tends to load faster
  if (!userLoaded) return <div />;


  // console.log(hello.data);

  return (
    <>
      <main className="flex h-screen justify-center">
        <div className="border-x border-slate-400 w-full md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {/* inline if true(!!) statement then(&&) do that */}
            {!isSignedIn && <SignInButton />}

            {/* {!!user.isSignedIn && <SignOutButton />} */}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          {!!isSignedIn && <UserButton />}
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
