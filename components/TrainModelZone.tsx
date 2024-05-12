"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import code from '@code-wallet/elements';

import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaFemale, FaImages, FaMale, FaRainbow } from "react-icons/fa";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";
import { upload } from "@vercel/blob/client";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";

type FormInput = z.infer<typeof fileUploadFormSchema>;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export default function TrainModelZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const [played, setPlayed] = useState(false);

  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { button } = code.elements.create('button', {
      currency: 'usd',
      destination: 'A2oV4BgWVqEMAc25UjPKx12Urmhs5HiXL8kyGJC5gWs4',
      amount: 0.05,
    });

    if (button) {
      button.on('success', (args: any): Promise<boolean | void> => {
        setPlayed(true);
        toast({
          title: "Paid",
          description:
            "$5 is successfully paid.",
          duration: 3000,
        });
        return Promise.resolve(true);
      });

      button.on('cancel', (args: any): Promise<boolean | void> => {
        setPlayed(false);
        return Promise.resolve(true);
      });

      button.mount(el.current!);
    }
  }, []);

  const form = useForm<FormInput>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      name: "",
      type: "man",
    },
  });

  const onSubmit: SubmitHandler<FormInput> = () => {
    trainModel();
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: File[] =
        acceptedFiles.filter(
          (file: File) => !files.some((f) => f.name === file.name)
        ) || [];

      // if user tries to upload more than 10 files, display a toast
      if (newFiles.length + files.length > 10) {
        toast({
          title: "Too many images",
          description:
            "You can only upload up to 10 images in total. Please try again.",
          duration: 5000,
        });
        return;
      }

      // display a toast if any duplicate files were found
      if (newFiles.length !== acceptedFiles.length) {
        toast({
          title: "Duplicate file names",
          description:
            "Some of the files you selected were already added. They were ignored.",
          duration: 5000,
        });
      }

      // check that in total images do not exceed a combined 4.5MB
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const newSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (totalSize + newSize > 4.5 * 1024 * 1024) {
        toast({
          title: "Images exceed size limit",
          description:
            "The total combined size of the images cannot exceed 4.5MB.",
          duration: 5000,
        });
        return;
      }

      setFiles([...files, ...newFiles]);

      toast({
        title: "Images selected",
        description: "The images were successfully selected.",
        duration: 5000,
      });
    },
    [files]
  );

  const removeFile = useCallback(
    (file: File) => {
      setFiles(files.filter((f) => f.name !== file.name));
    },
    [files]
  );

  const trainModel = useCallback(async () => {
    setIsLoading(true);
    // Upload each file to Vercel blob and store the resulting URLs
    const blobUrls = [];

    if (files) {
      for (const file of files) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/astria/train-model/image-upload",
        });
        blobUrls.push(blob.url);
      }
    }

    // console.log(blobUrls, "blobUrls");

    const payload = {
      urls: blobUrls,
      name: form.getValues("name").trim(),
      type: form.getValues("type"),
    };

    // Send the JSON payload to the "/astria/train-model" endpoint
    const response = await fetch("/astria/train-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (!response.ok) {
      const responseData = await response.json();
      const responseMessage: string = responseData.message;
      console.error("Something went wrong! ", responseMessage);
      const messageWithButton = (
        <div className="flex flex-col gap-4">
          {responseMessage}
          <a href="/get-credits">
            <Button size="sm">Get Credits</Button>
          </a>
        </div>
      );
      toast({
        title: "Something went wrong!",
        description: responseMessage.includes("Not enough credits")
          ? messageWithButton
          : responseMessage,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Model queued for training",
      description:
        "The model was queued for training. You will receive an email when the model is ready to use.",
      duration: 5000,
    });

    router.push("/");
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  const modelType = form.watch("type");

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px] p-[24px] rounded-md bg-[#141718]"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full rounded-md">
                {/* <FormLabel>Name</FormLabel>
                <FormDescription>
                  Give your model a name so you can easily identify it later.
                </FormDescription> */}
                <FormControl>
                  <Input
                    placeholder="Name your photo session"
                    {...field}
                    className="w-full h-[48px] p-[12px] bg-[#232627] border-solid border-[2px] border-[#343839] font-[400] text-[17px] landing-[24px] text-[#FEFEFE] focus-visible:ring-[#FEFEFE]"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormLabel>Type</FormLabel>
            <FormDescription>
              Select the type of headshots you want to generate.
            </FormDescription>
            <RadioGroup
              defaultValue={modelType}
              className="grid grid-cols-3 gap-4"
              value={modelType}
              onValueChange={(value) => {
                form.setValue("type", value);
              }}
            >
              <div>
                <RadioGroupItem
                  value="man"
                  id="man"
                  className="peer sr-only"
                  aria-label="man"
                />
                <Label
                  htmlFor="man"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FaMale className="mb-3 h-6 w-6" />
                  Man
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="woman"
                  id="woman"
                  className="peer sr-only"
                  aria-label="woman"
                />
                <Label
                  htmlFor="woman"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FaFemale className="mb-3 h-6 w-6" />
                  Woman
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="person"
                  id="person"
                  className="peer sr-only"
                  aria-label="person"
                />
                <Label
                  htmlFor="person"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FaRainbow className="mb-3 h-6 w-6" />
                  Unisex
                </Label>
              </div>
            </RadioGroup> */}

          <div className="flex flex-col gap-4 p-[20px] rounded-md bg-[#232627]">
            <div className="flex flex-row h-[36px] gap-[12px] justify-between">
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Gender</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                </select>
              </div>
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Shot</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Close-Up</option>
                  <option>Standard Headshot</option>
                  <option>Bust Shot</option>
                  <option>Three-Quarter Shot</option>
                  <option>Environmental Portrait</option>
                </select>
              </div>
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Background</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Solid color</option>
                  <option>Office environment</option>
                  <option>Outdoor</option>
                  <option>Abstarct</option>
                </select>
              </div>
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Light</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Natural</option>
                  <option>Studio</option>
                  <option>High Key(bright)</option>
                  <option>Low Key(shadowed)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-row gap-[12px]">
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Clothing</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Business Formal</option>
                  <option>Business Casual</option>
                  <option>Smart Casual</option>
                  <option>Creative</option>
                </select>
              </div>
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Expression</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Smiling</option>
                  <option>Serious</option>
                  <option>Pensive</option>
                  <option>Friendly</option>
                  <option>Approachable</option>
                </select>
              </div>
              <div className="flex flex-row px-[12px] py-[6px] gap-[8px] rounded-[6px] border-solid border-[1px] border-[#FEFEFE1A]">
                <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#6C7275]">Color Palette</p>
                <div className="border-l border-s-[#6C727580]"></div>
                <select className="row-start-1 col-start-1 w-[64px] h-[24px] bg-[#232627] border-none outline-none font-sans font-[600] text-[14px] landing-[24px] text-[#FEFEFE]">
                  <option>Warm</option>
                  <option>Cool</option>
                  <option>Neutral</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-[20px] gap-[8px] p-[12px] bg-[#232627]">
            <div
              {...getRootProps()}
              className=" rounded-md justify-center align-middle cursor-pointer flex flex-col gap-4"
            >
              {/* <FormLabel>Samples</FormLabel>
              <FormDescription>
                Upload 4-10 images of the person you want to generate headshots
                for.
              </FormDescription> */}
              <div className="flex justify-center align-middle w-full h-full rounded-[12px] outline-dashed outline-[2px] outline-[#343839] hover:outline-[#1c2022] p-4 gap-[24px]">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="self-center">Drop the files here ...</p>
                ) : (
                  <div className="flex flex-col justify-center items-center gap-[24px]">
                    {/* <FaImages size={32} className="text-gray-700" /> */}
                    <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10.5834 15.5835C10.5834 12.5459 13.0458 10.0835 16.0834 10.0835C19.1209 10.0835 21.5834 12.5459 21.5834 15.5835C21.5834 18.6211 19.1209 21.0835 16.0834 21.0835C13.0458 21.0835 10.5834 18.6211 10.5834 15.5835Z" fill="#FEFEFE" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M23.4167 3.66683H14.7243C13.2485 3.66681 12.0305 3.66679 11.0383 3.74785C10.0078 3.83205 9.06054 4.01275 8.17076 4.46612C6.7909 5.16919 5.66905 6.29105 4.96597 7.6709C4.51261 8.56068 4.33191 9.50797 4.24771 10.5385C4.16665 11.5307 4.16667 12.7487 4.16669 14.2244V29.7759C4.16667 31.2516 4.16665 32.4697 4.24771 33.4618C4.33191 34.4924 4.51261 35.4396 4.96597 36.3294C5.66905 37.7093 6.7909 38.8311 8.17076 39.5342C9.06054 39.9876 10.0078 40.1683 11.0383 40.2525C11.3599 40.2787 11.7051 40.2965 12.0752 40.3085C12.459 40.334 12.9179 40.3339 13.391 40.3338C19.4829 40.3338 25.5748 40.3335 31.6667 40.3335C31.752 40.3335 31.8361 40.3335 31.9189 40.3336C33.3771 40.3344 34.46 40.335 35.398 40.0836C37.9287 39.4055 39.9054 37.4288 40.5835 34.8982C40.9049 33.6987 40.8338 32.4143 40.8334 31.1842C40.8366 30.8372 40.8335 30.49 40.8336 30.1429C40.8345 29.2832 40.8353 28.5258 40.6359 27.802C40.4609 27.1668 40.1732 26.5682 39.7865 26.0348C39.3459 25.427 38.754 24.9544 38.0821 24.4181L32.8918 20.2661C32.5804 20.0169 32.2725 19.7705 31.9928 19.5795C31.6819 19.3673 31.2991 19.1468 30.82 19.024C30.1466 18.8513 29.438 18.8737 28.7767 19.0884C28.3064 19.2412 27.9383 19.4854 27.6413 19.7168C27.3742 19.925 27.0824 20.1903 26.7873 20.4587L11.1892 34.6388C10.7978 34.9945 10.4195 35.3384 10.1413 35.6393C10.0298 35.76 9.86041 35.9477 9.70206 36.1958C9.07318 35.8419 8.56161 35.3097 8.233 34.6648C8.0869 34.3781 7.96787 33.967 7.9022 33.1633C7.83478 32.3381 7.83336 31.2706 7.83336 29.7002V14.3002C7.83336 12.7298 7.83478 11.6622 7.9022 10.8371C7.96787 10.0333 8.0869 9.62227 8.233 9.33553C8.58453 8.64561 9.14546 8.08468 9.83539 7.73314C10.1221 7.58704 10.5332 7.46801 11.3369 7.40234C12.1621 7.33492 13.2296 7.3335 14.8 7.3335H23.4167C24.4292 7.3335 25.25 6.51269 25.25 5.50017C25.25 4.48764 24.4292 3.66683 23.4167 3.66683Z" fill="#FEFEFE" />
                      <path d="M36.6297 2.37047C36.2859 2.02665 35.8196 1.8335 35.3334 1.8335C34.8471 1.8335 34.3808 2.02665 34.037 2.37047L28.537 7.87047C27.821 8.58643 27.821 9.74723 28.537 10.4632C29.253 11.1792 30.4138 11.1792 31.1297 10.4632L33.5 8.09289V14.6668C33.5 15.6794 34.3208 16.5002 35.3334 16.5002C36.3459 16.5002 37.1667 15.6794 37.1667 14.6668V8.09289L39.537 10.4632C40.253 11.1792 41.4138 11.1792 42.1297 10.4632C42.8457 9.74723 42.8457 8.58643 42.1297 7.87047L36.6297 2.37047Z" fill="#FEFEFE" />
                    </svg>
                    <div className="text-center">
                      <p className="font-sans font-[600] text-[18px] landing-[40px] text-[#FEFEFE]">Drag and drop reference files here</p>
                      <p className="font-sans font-[500] text-[14px] landing-[24px] text-[#FEFEFE]">Upload up to 4 images of person you want to create headshots for.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col rounded-[20px] p-[24px] gap-[24px] bg-[#34383980]">
              <p className="font-[400] text-[17px] landing-[24px] text-[#FEFEFE]">Uploaded Photos</p>
              <div className="flex flex-row gap-[24px] flex-wrap">
                {files.map((file) => (
                  <div key={file.name} className="relative flex flex-row">
                    <img
                      src={URL.createObjectURL(file)}
                      className="rounded-[12px] w-[180px] h-[180px] object-cover"
                    />
                    <Button
                      className="absolute top-[8px] right-[8px] flex justify-end w-[32px] h-[32px] p-[8px] rounded-[32px] bg-[#FEFEFE] hover:bg-[#141718]"
                      onClick={() => removeFile(file)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.1667 4.00016V3.46683C10.1667 2.72009 10.1667 2.34672 10.0213 2.06151C9.89351 1.81063 9.68954 1.60665 9.43865 1.47882C9.15344 1.3335 8.78007 1.3335 8.03333 1.3335H6.96667C6.21993 1.3335 5.84656 1.3335 5.56135 1.47882C5.31046 1.60665 5.10649 1.81063 4.97866 2.06151C4.83333 2.34672 4.83333 2.72009 4.83333 3.46683V4.00016M6.16667 7.66683V11.0002M8.83333 7.66683V11.0002M1.5 4.00016H13.5M12.1667 4.00016V11.4668C12.1667 12.5869 12.1667 13.147 11.9487 13.5748C11.7569 13.9511 11.451 14.2571 11.0746 14.4488C10.6468 14.6668 10.0868 14.6668 8.96667 14.6668H6.03333C4.91323 14.6668 4.35318 14.6668 3.92535 14.4488C3.54903 14.2571 3.24307 13.9511 3.05132 13.5748C2.83333 13.147 2.83333 12.5869 2.83333 11.4668V4.00016" stroke="#6C7275" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!played ?
            <div className="flex flex-col gap-[12px] mb-[40px]">
              <div className="h-[22px] gap-[16px]"></div>
              <div className="gap-[12px]">
                <p className="font-sans font-[600] text-[24px] landing-[40px] text-center text-[#FEFEFE]">Generate image for $5</p>
              </div>
              <div className="gap-[16px] text-center">
                <div ref={el} />
                {/* <Button type="button" className="w-[252px] h-[50px] rounded-[6px] py-[8px] px-[16px] gap-[8px] bg-[#FEFEFE] hover:bg-[#343839] text-[18px] text-[#141718]" onClick={() => setPlayed(true)}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block w-7 h-7 mr-4"><path d="M6.8162 9.96424C8.50269 9.96424 9.87999 8.60099 9.87999 6.90045C9.87999 5.19991 8.51674 3.83667 6.8162 3.83667C5.11566 3.83667 3.75242 5.19991 3.75242 6.90045C3.75242 8.60099 5.12972 9.96424 6.8162 9.96424Z" fill="currentColor"></path><path d="M19.0573 9.96424C20.7438 9.96424 22.1211 8.60099 22.1211 6.90045C22.1211 5.19991 20.7579 3.83667 19.0573 3.83667C17.3709 3.83667 15.9936 5.19991 15.9936 6.90045C15.9936 8.60099 17.3709 9.96424 19.0573 9.96424Z" fill="currentColor"></path><path d="M19.0573 22.2054C20.7438 22.2054 22.1211 20.8422 22.1211 19.1417C22.1211 17.4552 20.7579 16.0779 19.0573 16.0779C17.3709 16.0779 15.9936 17.4411 15.9936 19.1417C16.0076 20.8282 17.3709 22.2054 19.0573 22.2054Z" fill="currentColor"></path><path d="M6.8162 22.2054C8.50269 22.2054 9.87999 20.8422 9.87999 19.1417C9.87999 17.4552 8.51674 16.0779 6.8162 16.0779C5.11566 16.0779 3.75242 17.4411 3.75242 19.1417C3.76647 20.8282 5.12972 22.2054 6.8162 22.2054Z" fill="currentColor"></path><path d="M6.88648 16.0918C8.57297 16.0918 9.95027 14.7285 9.95027 13.028C9.93621 11.3415 8.57297 9.97827 6.88648 9.97827C5.19999 9.97827 3.8227 11.3415 3.8227 13.0421C3.8227 14.7145 5.19999 16.0918 6.88648 16.0918Z" fill="currentColor"></path><path d="M12.9438 9.99231C14.6303 9.99231 16.0076 8.62907 16.0076 6.92853C16.0076 5.24204 14.6444 3.86475 12.9438 3.86475C11.2573 3.86475 9.88004 5.22799 9.88004 6.92853C9.88004 8.62907 11.2573 9.99231 12.9438 9.99231Z" fill="currentColor"></path><path d="M12.9438 25.9999C13.9978 25.9999 14.8551 25.1427 14.8551 24.0886C14.8551 23.0345 13.9978 22.1772 12.9438 22.1772C11.8897 22.1772 11.0324 23.0345 11.0324 24.0886C11.0324 25.1427 11.8897 25.9999 12.9438 25.9999Z" fill="currentColor"></path><path d="M12.9438 3.8227C13.9978 3.8227 14.8551 2.96541 14.8551 1.91135C14.8551 0.857297 13.9978 0 12.9438 0C11.8897 0 11.0324 0.857297 11.0324 1.91135C11.0324 2.96541 11.8897 3.8227 12.9438 3.8227Z" fill="currentColor"></path><path d="M1.91135 14.9394C2.96541 14.9394 3.8227 14.0821 3.8227 13.0281C3.8227 11.974 2.96541 11.1167 1.91135 11.1167C0.857297 11.1167 0 11.974 0 13.0281C0 14.0821 0.857297 14.9394 1.91135 14.9394Z" fill="currentColor"></path><path d="M24.0324 14.9394C25.0865 14.9394 25.9438 14.0821 25.9438 13.0281C25.9438 11.974 25.0865 11.1167 24.0324 11.1167C22.9784 11.1167 22.1211 11.974 22.1211 13.0281C22.1211 14.0821 22.9643 14.9394 24.0324 14.9394Z" fill="currentColor"></path><path d="M12.9438 22.1774C14.6303 22.1774 16.0076 20.8141 16.0076 19.1136C16.0076 17.4271 14.6444 16.0498 12.9438 16.0498C11.2573 16.0498 9.88004 17.413 9.88004 19.1136C9.88004 20.8001 11.2573 22.1774 12.9438 22.1774Z" fill="currentColor"></path></svg>
                  Pay with Code
                  {stripeIsConfigured && <span className="ml-1">(1 Credit)</span>}
                </Button> */}
              </div>
            </div> :
            <div className="flex flex-col gap-[12px] mb-[40px]">
              <div className="h-[22px] gap-[16px]"></div>
              <div className="gap-[16px] text-center">
                <Button type="submit" className="w-[312px] h-[48px] rounded-[12px] p-[12px] gap-[8px]" isLoading={isLoading}>
                  <p className="font-sans font-[600] text-[16px] landing-[24px]">Generate My Photos</p>
                </Button>
              </div>
            </div>
          }

        </form>
      </Form>
    </div >
  );
}
