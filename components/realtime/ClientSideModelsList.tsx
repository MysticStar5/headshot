"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { modelRowWithSamples } from "@/types/utils";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaImages } from "react-icons/fa";
import ModelsTable from "../ModelsTable";

import TrainModelZone from "@/components/TrainModelZone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaArrowLeft } from "react-icons/fa";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useRouter } from "next/navigation";

export const revalidate = 0;

type ClientSideModelsListProps = {
  serverModels: modelRowWithSamples[] | [];
};

export default function ClientSideModelsList({
  serverModels,
}: ClientSideModelsListProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  const [models, setModels] = useState<modelRowWithSamples[]>(serverModels);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-models")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "models" },
        async (payload: any) => {

          const samples = await supabase
            .from("samples")
            .select("*")
            .eq("modelId", payload.new.id);

          const newModel: modelRowWithSamples = {
            ...payload.new,
            samples: samples.data,
          };

          const dedupedModels = models.filter(
            (model) => model.id !== payload.old?.id
          );

          setModels([...dedupedModels, newModel]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, models, setModels]);

  const router = useRouter();
  const handleRedirect = (id: number) => {
    router.push(`/overview/models/${id}`);
  };

  return (<>
    {/* <div id="train-model-container" className="w-full">
      {models && models.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 w-full justify-between items-center text-center">
            <h1>Your models</h1>
            <Link href="/overview/models/train" className="w-fit">
              <Button size={"sm"}>
                Train model
              </Button>
            </Link>
          </div>
          <ModelsTable models={models} />
        </div>
      )}
      {models && models.length === 0 && (
        <div className="flex flex-col gap-4 items-center">
          <FaImages size={64} className="text-gray-500" />
          <h1 className="text-2xl">
            Get started by training your first model.
          </h1>
          <div>
            <Link href="/overview/models/train">
              <Button size={"lg"}>Train model</Button>
            </Link>
          </div>
        </div>
      )}
    </div> */}

    <div className="flex flex-1 flex-row w-full rounded-lg bg-[#232627]">
      <div className="flex flex-col items-center w-full border-solid border-r-[1px] border-[#343839]">
        <div className="w-full h-[72px] px-[40px] py-[16px] border-solid border-b-[1px] border-[#343839]">
          <p className="font-sans font-[600] text-[24px] landing-[40px] text-[#FEFEFE]">New Session</p>
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <Card className="w-[800px]">
            <CardContent>
              <TrainModelZone />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col w-[360px] p-6 gap-[16px]">
        <p className="px-[12px] font-sans font-[600] text-[14px] landing-[24px] text-[#6C7275BF]">My Sessions</p>
        <div className="w-full p-3 rounded-md bg-[#343839]">
          <label className="flex flex-row ">
            <input type="checkbox" className="w-[22px] h-[22px] mr-3" />
            <p className="font-sans font-[600] text-[16px] landing-[24px] text-[#FEFEFE]">New Session</p>
          </label>
        </div>

        {models?.map(model => (
          < div className="flex flex-col w-full rounded-md p-[12px] gap-[8px] hover:bg-[#343839]" onClick={() => handleRedirect(model.id)}>
            <label className="flex flex-row ">
              <input type="checkbox" className="w-[22px] h-[22px] mr-3" />
              <p className="font-sans font-[600] text-[16px] landing-[24px] text-[#FEFEFE]">{model.name}</p>
            </label>
            {model.status != "processing" &&
              <div className="flex flex-row p-[8px] pl-[36px]">
                <Avatar key={model.samples[0].id} className="w-[128px] h-[128px]">
                  <AvatarImage src={model.samples[0].uri} className="object-cover" />
                </Avatar>
                <Avatar key={model.samples[1].id} className="w-[128px] h-[128px]">
                  <AvatarImage src={model.samples[1].uri} className="object-cover" />
                </Avatar>
              </div>
            }
            <div className="flex flex-row items-center pl-[36px]">
              {model.samples.slice(0, 3).map((sample) => (
                <Avatar key={sample.id} className="w-8 h-8">
                  <AvatarImage src={sample.uri} className="object-cover" />
                </Avatar>
              ))}
              {model.samples.length > 3 && (
                <Badge className="rounded-full w-8 h-8" variant={"outline"}>
                  +{model.samples.length - 3}
                </Badge>
              )}
              <p className="flex justify-end font-sans font-[500] text-[11px] landing-[16px] text-[#6C7275BF]">{model.status === "processing" ? "Generating..." : "Finished"}</p>
            </div>
          </div>
        ))}
      </div>
    </div >
  </>
  );
}
