"use client";
import { api } from "../../convex/_generated/api";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStablePaginatedQuery } from "../lib/hooks/use-stable-query";
import RecommendCard from "../../components/cards/recommend-card";

const Cards = () => {
    const { t } = useTranslation();
    const { results, status, loadMore } = useStablePaginatedQuery(
      api.cards.allCards,
      {},
      { initialNumItems: 10 },
    );

    const cards = results || [];

    console.log("cards", cards)

    const ref = useRef(null);
    const inView = useInView(ref);

  
    useEffect(() => {
      if (inView) {
          loadMore(10);
      }
    }, [inView, loadMore]);
  
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-1 px-4 font-medium lg:mt-2 lg:px-0">
          {t("Cards")}
        </div>
        <div className="flex w-full grid-cols-2 flex-col gap-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:pl-0 2xl:grid-cols-4">
          {
          cards.map(
            (card, index) =>
              <RecommendCard
                id={card.characterId}
                imageUrl={card.imageUrl}
                introduces={card.introduces || ''}
              />
          )
          }
          <div ref={ref} />
        </div>
      </div>
    );
  };
  
  export default Cards;
  