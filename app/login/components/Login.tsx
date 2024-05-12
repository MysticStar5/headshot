"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import disposableDomains from "disposable-email-domains";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineGoogle } from "react-icons/ai";
import { WaitingForMagicLink } from "./WaitingForMagicLink";

import image311 from "/public/image311.png";
import React from "react";


type Inputs = {
  email: string;
};

export const Login = ({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      await signInWithMagicLink(data.email);
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Email sent",
          description: "Check your inbox for a magic link to sign in.",
          duration: 5000,
        });
        setIsMagicLinkSent(true);
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description:
          "Please try again, if the problem persists, contact us at hello@tryleap.ai",
        duration: 5000,
      });
    }
  };

  let inviteToken = null;
  if (searchParams && "inviteToken" in searchParams) {
    inviteToken = searchParams["inviteToken"];
  }

  const protocol = host?.includes("localhost") ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/auth/callback`;

  console.log({ redirectUrl });

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    console.log(data, error);
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.log(`Error: ${error.message}`);
    }
  };

  // if (isMagicLinkSent) {
  //   return (
  //     <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />
  //   );
  // }

  const [signType, setSignType] = React.useState(true);

  return (
    <>
      <div className="flex w-full h-[100vh]">
        <div className="flex flex-col !w-[640px] max-xl:hidden">
          <div className="h-1/2 p-[80px]">
            <p className="font-sans font-bold text-5xl leading-[56px] text-[#FEFEFE]">Elevate Your Professional Image</p>
            <p className="text-[#E8ECEF80] text-[24px] leading-[36px]">Transform your photos with AI-driven precision instantly.</p>
          </div>
          <div className="h-1/2">
            <img src={image311.src} className="rounded-lg object-cover w-full h-full" ></img>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-[#232627] max-xl:ml-6 ml-0 rounded-xl mr-6 my-6 p-8 flex-1">
          <div className="w-[504px] max-sm:w-full">
            <p className="font-sans font-bold text-[38px] landing-[56px] text-[#FEFEFE] text-center p-2 mb-8 h-[72px]">Company AI</p>

            <div className="bg-[#141718] flex justify-around h-[48px] w-full p-1 gap-2 rounded-xl my-[32px]">
              <div className={`flex w-full justify-center items-center rounded-[10px] ${signType ? "bg-[#232627]" : "bg-[#141718]"}`} onClick={() => { setSignType(true) }}>
                <label className={`font-semibold text-[14px] ${signType ? "text-[#FEFEFE]" : "text-[#6C7275]"}`}>Sign In</label>
              </div>
              <div className={`flex w-full justify-center items-center rounded-[10px] ${!signType ? "bg-[#232627]" : "bg-[#141718]"}`} onClick={() => { setSignType(false) }}>
                <label className={`font-semibold text-[14px] ${!signType ? "text-[#FEFEFE]" : "text-[#6C7275]"}`}>Create account</label>
              </div>
            </div>

            <div className="mb-8">
              <Button
                onClick={signInWithGoogle}
                variant={"outline"}
                className="w-full mb-3 h-[52px] border-[2px] border-[#343839] hover:bg-[#0084FF]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-4">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#0084FF" />
                  <path d="M11.9999 23.0001C14.9699 23.0001 17.4599 22.0201 19.2799 20.3401L15.7099 17.5701C14.7299 18.2301 13.4799 18.6301 11.9999 18.6301C9.13993 18.6301 6.70993 16.7001 5.83993 14.1001H2.17993V16.9401C3.98993 20.5301 7.69993 23.0001 11.9999 23.0001Z" fill="#34A853" />
                  <path d="M5.84 14.0901C5.62 13.4301 5.49 12.7301 5.49 12.0001C5.49 11.2701 5.62 10.5701 5.84 9.91007V7.07007H2.18C1.43 8.55007 1 10.2201 1 12.0001C1 13.7801 1.43 15.4501 2.18 16.9301L5.03 14.7101L5.84 14.0901Z" fill="#FBBC05" />
                  <path d="M11.9999 5.38C13.6199 5.38 15.0599 5.94 16.2099 7.02L19.3599 3.87C17.4499 2.09 14.9699 1 11.9999 1C7.69993 1 3.98993 3.47 2.17993 7.07L5.83993 9.91C6.70993 7.31 9.13993 5.38 11.9999 5.38Z" fill="#EA4335" />
                </svg>
                {/* <AiOutlineGoogle size={20} /> */}
                <p className="font-sans font-[600] text-[16px] landing-[24px] text-[#FEFEFE]">Continue with Google</p>
              </Button>
              <Button
                // onClick={signInWithApple}
                variant={"outline"}
                className="w-full h-[52px]  border-[2px] border-[#343839] hover:bg-[#0084FF]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-4">
                  <g clipPath="url(#clip0_12_373)">
                    <path d="M20.9144 8.1816C20.7752 8.2896 18.3176 9.6744 18.3176 12.7536C18.3176 16.3152 21.4448 17.5752 21.5384 17.6064C21.524 17.6832 21.0416 19.332 19.8896 21.012C18.8624 22.4904 17.7896 23.9664 16.1576 23.9664C14.5256 23.9664 14.1056 23.0184 12.2216 23.0184C10.3856 23.0184 9.7328 23.9976 8.24 23.9976C6.7472 23.9976 5.7056 22.6296 4.508 20.9496C3.1208 18.9768 2 15.912 2 13.0032C2 8.3376 5.0336 5.8632 8.0192 5.8632C9.6056 5.8632 10.928 6.9048 11.924 6.9048C12.872 6.9048 14.3504 5.8008 16.1552 5.8008C16.8392 5.8008 19.2968 5.8632 20.9144 8.1816ZM15.2984 3.8256C16.0448 2.94 16.5728 1.7112 16.5728 0.4824C16.5728 0.312 16.5584 0.1392 16.5272 0C15.3128 0.0456 13.868 0.8088 12.9968 1.8192C12.3128 2.5968 11.6744 3.8256 11.6744 5.0712C11.6744 5.2584 11.7056 5.4456 11.72 5.5056C11.7968 5.52 11.9216 5.5368 12.0464 5.5368C13.136 5.5368 14.5064 4.8072 15.2984 3.8256Z" fill="#141718" />
                  </g>
                  <defs>
                    <clipPath id="clip0_12_373">
                      <rect width="19.536" height="24" fill="white" transform="translate(2)" />
                    </clipPath>
                  </defs>
                </svg>
                {/* <AiOutlineGoogle size={20} /> */}
                <p className="font-sans font-[600] text-[16px] landing-[24px] text-[#FEFEFE]">Continue with Apple</p>
              </Button>
            </div>

            <OR />

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col"
            >
              <div className="flex flex-col">
                <div className="flex flex-col mb-6">
                  <div className="mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute ml-4 my-3.5">
                      <path d="M3.77785 8.81786C3.52791 8.63933 3.40294 8.55007 3.29398 8.53848C3.13105 8.52114 2.96775 8.60518 2.88714 8.74784C2.83325 8.84324 2.83325 8.99513 2.83325 9.29891V14.7011C2.83324 15.3719 2.83323 15.9255 2.87008 16.3765C2.90835 16.8449 2.99049 17.2755 3.19656 17.68C3.51614 18.3072 4.02608 18.8171 4.65328 19.1367C5.05773 19.3428 5.48832 19.4249 5.95673 19.4632C6.40772 19.5 6.96135 19.5 7.63215 19.5H16.3677C17.0385 19.5 17.5921 19.5 18.0431 19.4632C18.5115 19.4249 18.9421 19.3428 19.3466 19.1367C19.9738 18.8171 20.4837 18.3072 20.8033 17.68C21.0093 17.2755 21.0915 16.8449 21.1298 16.3765C21.1666 15.9255 21.1666 15.3719 21.1666 14.7011V9.2989C21.1666 9.15001 21.1666 9.07557 21.1529 9.02358C21.0913 8.78856 20.8358 8.65468 20.6074 8.73776C20.5569 8.75614 20.495 8.79905 20.371 8.88487L13.9192 13.3516C13.4618 13.6693 13.0601 13.9482 12.6038 14.0588C12.2047 14.1556 11.7879 14.1525 11.3903 14.0499C10.9357 13.9326 10.5382 13.6478 10.0855 13.3234L3.77785 8.81786Z" fill="#6C7275" fillOpacity="0.5" />
                      <path d="M20.4439 6.80727C20.5978 6.70077 20.6747 6.64752 20.7219 6.56187C20.7586 6.49536 20.7796 6.39003 20.7712 6.31454C20.7604 6.21733 20.7191 6.15314 20.6364 6.02478C20.3199 5.53304 19.8643 5.12713 19.3466 4.86331C18.9421 4.65724 18.5115 4.5751 18.0431 4.53683C17.5921 4.49998 17.0385 4.49999 16.3677 4.5H7.63217C6.96137 4.49999 6.40772 4.49998 5.95673 4.53683C5.48832 4.5751 5.05773 4.65724 4.65328 4.86331C4.18742 5.10068 3.78475 5.44384 3.47856 5.86112C3.38222 5.99241 3.33406 6.05805 3.31819 6.15767C3.30578 6.23558 3.32311 6.34381 3.35922 6.41395C3.4054 6.50364 3.4855 6.56085 3.64569 6.67527L10.9583 11.8986C11.5643 12.3314 11.6929 12.4067 11.8067 12.4361C11.9392 12.4703 12.0782 12.4713 12.2112 12.4391C12.3254 12.4114 12.4551 12.338 13.0674 11.9141L20.4439 6.80727Z" fill="#6C7275" fillOpacity="0.5" />
                    </svg>
                    <Input
                      type="email"
                      placeholder="Username or email"
                      className="block font-sans font-[500] text-[14px] landing-[24px] text-white opacity-50 h-[52px] py-4 pl-[52px] pr-3.5 border-none outline-none bg-[#141718] ring-[#0084FF] autofill:bg-red-600"
                      {...register("email", {
                        required: true,
                        validate: {
                          emailIsValid: (value: string) =>
                            /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                            "Please enter a valid email",
                          emailDoesntHavePlus: (value: string) =>
                            /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                            "Email addresses with a '+' are not allowed",
                          emailIsntDisposable: (value: string) =>
                            !disposableDomains.includes(value.split("@")[1]) ||
                            "Please use a permanent email address",
                        },
                      })}
                    />
                    {isSubmitted && errors.email && (
                      <span className={"text-xs text-red-400"}>
                        {errors.email?.message || "Email is required to sign in"}
                      </span>
                    )}
                  </div>

                  <div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute ml-4 my-3.5">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 8.6665C7 5.90508 9.23858 3.6665 12 3.6665C14.7614 3.6665 17 5.90508 17 8.6665V9.62511C17.2355 9.67672 17.4615 9.75186 17.68 9.86315C18.3072 10.1827 18.8171 10.6927 19.1367 11.3199C19.3428 11.7243 19.4249 12.1549 19.4632 12.6233C19.5 13.0743 19.5 13.6279 19.5 14.2987V15.5343C19.5 16.2051 19.5 16.7587 19.4632 17.2097C19.4249 17.6781 19.3428 18.1087 19.1367 18.5131C18.8171 19.1403 18.3072 19.6503 17.68 19.9699C17.2755 20.1759 16.8449 20.2581 16.3765 20.2963C15.9255 20.3332 15.3719 20.3332 14.7011 20.3332H9.29894C8.62812 20.3332 8.07448 20.3332 7.62348 20.2963C7.15507 20.2581 6.72448 20.1759 6.32003 19.9699C5.69283 19.6503 5.18289 19.1403 4.86331 18.5131C4.65724 18.1087 4.5751 17.6781 4.53683 17.2097C4.49998 16.7587 4.49999 16.2051 4.5 15.5343V14.2987C4.49999 13.6279 4.49998 13.0743 4.53683 12.6233C4.5751 12.1549 4.65724 11.7243 4.86331 11.3199C5.18289 10.6927 5.69283 10.1827 6.32003 9.86315C6.53845 9.75186 6.76449 9.67672 7 9.62511V8.6665ZM15.3333 8.6665V9.50119H8.66667V8.6665C8.66667 6.82556 10.1591 5.33317 12 5.33317C13.8409 5.33317 15.3333 6.82556 15.3333 8.6665ZM12.8333 14.0832C12.8333 13.6229 12.4602 13.2498 12 13.2498C11.5398 13.2498 11.1667 13.6229 11.1667 14.0832V15.7498C11.1667 16.2101 11.5398 16.5832 12 16.5832C12.4602 16.5832 12.8333 16.2101 12.8333 15.7498V14.0832Z" fill="#6C7275" fillOpacity="0.5" />
                    </svg>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="block font-sans font-[500] text-[14px] landing-[24px] text-white opacity-50 h-[52px] py-4 pl-[52px] pr-3.5 mb-2 border-none bg-[#141718] ring-[#0084FF]"
                    />
                    {!signType && <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute ml-4 my-3.5">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 8.6665C7 5.90508 9.23858 3.6665 12 3.6665C14.7614 3.6665 17 5.90508 17 8.6665V9.62511C17.2355 9.67672 17.4615 9.75186 17.68 9.86315C18.3072 10.1827 18.8171 10.6927 19.1367 11.3199C19.3428 11.7243 19.4249 12.1549 19.4632 12.6233C19.5 13.0743 19.5 13.6279 19.5 14.2987V15.5343C19.5 16.2051 19.5 16.7587 19.4632 17.2097C19.4249 17.6781 19.3428 18.1087 19.1367 18.5131C18.8171 19.1403 18.3072 19.6503 17.68 19.9699C17.2755 20.1759 16.8449 20.2581 16.3765 20.2963C15.9255 20.3332 15.3719 20.3332 14.7011 20.3332H9.29894C8.62812 20.3332 8.07448 20.3332 7.62348 20.2963C7.15507 20.2581 6.72448 20.1759 6.32003 19.9699C5.69283 19.6503 5.18289 19.1403 4.86331 18.5131C4.65724 18.1087 4.5751 17.6781 4.53683 17.2097C4.49998 16.7587 4.49999 16.2051 4.5 15.5343V14.2987C4.49999 13.6279 4.49998 13.0743 4.53683 12.6233C4.5751 12.1549 4.65724 11.7243 4.86331 11.3199C5.18289 10.6927 5.69283 10.1827 6.32003 9.86315C6.53845 9.75186 6.76449 9.67672 7 9.62511V8.6665ZM15.3333 8.6665V9.50119H8.66667V8.6665C8.66667 6.82556 10.1591 5.33317 12 5.33317C13.8409 5.33317 15.3333 6.82556 15.3333 8.6665ZM12.8333 14.0832C12.8333 13.6229 12.4602 13.2498 12 13.2498C11.5398 13.2498 11.1667 13.6229 11.1667 14.0832V15.7498C11.1667 16.2101 11.5398 16.5832 12 16.5832C12.4602 16.5832 12.8333 16.2101 12.8333 15.7498V14.0832Z" fill="#6C7275" fillOpacity="0.5" />
                    </svg>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        className="block font-sans font-[500] text-[14px] landing-[24px] text-white opacity-50 h-[52px] py-4 pl-[52px] pr-3.5 mb-2 border-none bg-[#141718] ring-[#0084FF]"
                      /></>}
                    {signType && <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#0084FF] h-6 w-[118px]">Forgot Password?</p>}
                  </div>
                </div>
                <Button
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  // variant="outline"
                  type="submit"
                  className="w-full h-[52px] p-[14px, 24px, 14px, 24px] bg-[#0084FF]"
                >
                  {signType && <p className="font-sans font-[600] text-[16px] landing-[24px] text-[#FEFEFE]">Sign In</p>}
                  {!signType && <p className="font-sans font-[600] text-[16px] landing-[24px] text-[#FEFEFE]">Create Account</p>}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div >
    </>
  );
};

export const OR = () => {
  return (
    <div className="flex items-center my-1 text-[#6C727580] mb-8">
      <div className="border-b flex-grow mr-2 border-[1px] border-[#6C727580]" />
      <span className="font-sans font-[500] text-[12px] landing-[20px]">OR</span>
      <div className="border-b flex-grow ml-2 border-[1px] border-[#6C727580]" />
    </div>
  );
};
