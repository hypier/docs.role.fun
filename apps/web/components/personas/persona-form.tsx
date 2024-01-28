import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@repo/ui/src/components/card";
import { Label } from "@repo/ui/src/components/label";
import { Input } from "@repo/ui/src/components/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/src/components/alert-dialog";
import { Textarea } from "@repo/ui/src/components/textarea";
import { Button } from "@repo/ui/src/components/button";
import { ArrowLeft, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/src/components/form";
import { useUser } from "@clerk/nextjs";
import { RadioGroup, RadioGroupItem } from "@repo/ui/src/components/radio";
import { Checkbox } from "@repo/ui/src/components/checkbox";
import useCurrentUser from "../../app/lib/hooks/use-current-user";
import Image from "next/image";

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  isDefault: z.boolean(),
});

interface PersonaProps {
  id?: Id<"personas">;
  name?: string;
  description?: string;
  cardImageUrl?: string;
  isEdit?: boolean;
  isPrivate?: boolean;
  onClickGoBack: any;
}

export default function PersonaForm({
  id,
  name = "",
  description = "",
  cardImageUrl = "",
  isEdit = false,
  isPrivate = true,
  onClickGoBack,
}: PersonaProps) {
  const create = useMutation(api.personas.create);
  const update = useMutation(api.personas.update);
  const remove = useMutation(api.personas.remove);
  const generateUploadUrl = useMutation(api.characters.generateUploadUrl);
  const { user } = useUser();
  const currentUser = useCurrentUser();

  const imageInput = useRef<HTMLInputElement>(null);
  const [personaId, setPersonaId] = useState<Id<"personas"> | undefined>(id);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState(
    isPrivate ? "private" : "public",
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name ? name : (user?.fullName as string),
      description: description,
      isPrivate: visibility === "private",
      isDefault: personaId && currentUser?.primaryPersonaId === personaId,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (personaId) {
      const promise = update({
        id: personaId as Id<"personas">,
        ...values,
      });
      toast.promise(promise, {
        loading: "Updating persona...",
        success: () => {
          onClickGoBack();
          return `Persona has been updated.`;
        },
        error: (error) => {
          return error
            ? (error.data as { message: string }).message
            : "Unexpected error occurred";
        },
      });
    } else {
      const promise = create({
        ...values,
      });
      toast.promise(promise, {
        loading: "Creating persona...",
        success: (persona) => {
          persona && setPersonaId(persona);
          return `Persona has been created.`;
        },
        error: (error) => {
          return error
            ? (error.data as { message: string }).message
            : "Unexpected error occurred";
        },
      });
    }
  }

  async function handleUploadImage(uploadedImage: File) {
    const validImageTypes = [
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!validImageTypes.includes(uploadedImage.type)) {
      toast.error(
        "Invalid file type. Please upload a valid image file (gif, jpeg, png)",
      );
      return;
    }
    if (uploadedImage.size > 5242880) {
      toast.error("File size should be less than 5MB");
      return;
    }
    const promise = generateUploadUrl()
      .then((postUrl) =>
        fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": uploadedImage!.type },
          body: uploadedImage,
        }),
      )
      .then((result) => result.json())
      .then(async ({ storageId }) => {
        if (personaId) {
          await update({
            id: personaId as Id<"personas">,
            cardImageStorageId: storageId,
          });
        } else {
          return create({
            isPrivate: false,
            cardImageStorageId: storageId,
          });
        }
      });

    toast.promise(promise, {
      loading: "Uploading persona card...",
      success: (persona) => {
        persona && setPersonaId(persona);
        return `Persona card has been uploaded.`;
      },
      error: (error) => {
        return error
          ? (error.data as { message: string }).message
          : "Unexpected error occurred";
      },
    });
  }

  const imageUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : cardImageUrl;

  return (
    <>
      <Card className="h-full w-full overflow-hidden rounded-b-none border-transparent shadow-none lg:border-border lg:shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div className="flex items-center gap-2">
              {onClickGoBack && (
                <Button variant="ghost" onClick={onClickGoBack} size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {isEdit ? `Edit persona` : "My persona"}
            </div>
            {personaId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground">
                    Delete persona
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {`This action cannot be undone. This will permanently delete
                     persona ${name}.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const promise = remove({
                          id: personaId as Id<"personas">,
                        });
                        toast.promise(promise, {
                          loading: "Deleting persona...",
                          success: () => {
                            onClickGoBack();
                            return `Persona has been deleted.`;
                          },
                          error: (error) => {
                            return error
                              ? (error.data as { message: string }).message
                              : "Unexpected error occurred";
                          },
                        });
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardTitle>
          <CardDescription>Configure persona details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="my-4 flex w-full justify-center">
            <Label
              htmlFor="card"
              className="relative flex h-[350px] w-[200px] cursor-pointer flex-col items-center justify-center rounded border border-dashed duration-200 hover:-translate-y-1 hover:border-border hover:shadow-lg"
            >
              <Plus />
              Add persona card
              <span className="text-xs text-muted-foreground">
                Best size: 1024x1792
              </span>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={"Preview of character card"}
                  width={300}
                  height={525}
                  className="pointer-events-none absolute h-full w-full rounded object-cover"
                />
              )}
            </Label>
            <Input
              id="card"
              type="file"
              accept="image/*"
              ref={imageInput}
              onChange={(event: any) => {
                setSelectedImage(event.target.files![0]);
                handleUploadImage(event.target.files![0]);
              }}
              className="hidden"
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col space-y-2">
                      <FormLabel>Name</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        What do characters refer to you as?
                      </span>
                    </div>
                    <FormControl>
                      <Input placeholder="Name your persona" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col space-y-2">
                      <FormLabel>Description</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        What information would you like to share with
                        Characters?
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[128px]"
                        {...field}
                        placeholder={`Name: Alexa
Gender: Female
Age: 28
Height: 5'6"
Weight: 145 lbs
Hair: Short, Straight, and Black
Eye Color: Blue
Personality: Introverted, thoughtful, analytical, creative
Likes: Hiking, Gardening, Painting, Solving Puzzles, Cooking, Classical Music, and Traveling.
Dislikes: Fast food, Hot weather, and Reality TV.
Talents: Painting, Cooking, and Chess.
`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-2">
                <FormLabel>Publish to</FormLabel>
                <span className="text-xs text-muted-foreground">
                  Public persona will be visible to other users.
                </span>
                <RadioGroup
                  defaultValue={visibility}
                  onValueChange={setVisibility}
                >
                  <div className="flex items-center space-x-2 pt-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label className="font-normal" htmlFor="public">
                      Public
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label className="font-normal" htmlFor="private">
                      Only me
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <div className="flex flex-col space-y-2">
                    <FormLabel>Default persona</FormLabel>
                    <FormItem className="flex items-center space-x-2 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>

                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs">
                          Use this persona as default.
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Characters will recognize your default persona.
                        </FormDescription>
                      </div>
                    </FormItem>
                  </div>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pb-32">
          <Button className="ml-auto" onClick={form.handleSubmit(onSubmit)}>
            Save
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
