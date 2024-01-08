import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Story } from "../../app/character/[id]/story/[storyId]/story";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/src/components/carousel";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export const MainStories = () => {
  const { results, loadMore } = usePaginatedQuery(
    api.stories.listAll,
    {},
    { initialNumItems: 5 },
  );
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      loadMore(10);
    }
  }, [inView, loadMore]);
  return (
    <section className="flex flex-col gap-4 lg:gap-8">
      <div className="self-center px-4 font-medium lg:px-0">Stories</div>
      <div className="border-y bg-background p-2 py-12 !text-xs lg:rounded-lg lg:border lg:shadow-lg">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="mx-12"
        >
          <CarouselContent className="w-full">
            {results?.length > 0 ? (
              results.map((story, i) => (
                <div ref={i === results?.length - 1 ? ref : undefined}>
                  <CarouselItem
                    className="group ml-4 h-[32rem] w-72 overflow-hidden rounded-lg border pl-0 shadow-lg md:basis-1/2 lg:basis-1/3"
                    key={story._id}
                  >
                    <Link
                      href={`/character/${story.characterId}/story/${story._id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Story
                        isCard={true}
                        storyId={story._id}
                        characterId={story.characterId}
                      />
                    </Link>
                  </CarouselItem>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No stories yet.
              </div>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};
