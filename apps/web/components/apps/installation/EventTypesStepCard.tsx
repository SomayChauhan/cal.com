import type { TEventType, TEventTypesForm } from "@pages/apps/installation/[[...step]]";
import type { Dispatch, SetStateAction } from "react";
import type { FC } from "react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";
import { ScrollableArea, Badge, Button } from "@calcom/ui";
import { Clock } from "@calcom/ui/components/icon";

type EventTypesCardProps = {
  userName: string;
  setConfigureStep: Dispatch<SetStateAction<boolean>>;
};

export const EventTypesStepCard: FC<EventTypesCardProps> = ({ setConfigureStep, userName }) => {
  const { control } = useFormContext<TEventTypesForm>();
  const { fields, update } = useFieldArray({
    control,
    name: "eventTypes",
    keyName: "fieldId",
  });

  return (
    <>
      <div className="sm:border-subtle bg-default mt-10  border dark:bg-black sm:rounded-md">
        <ScrollableArea className="rounded-md">
          <ul className="border-subtle max-h-97 !static w-full divide-y">
            {fields.map((field, index) => (
              <EventTypeCard
                handleSelect={() => update(index, { ...field, selected: !field.selected })}
                userName={userName}
                key={field.fieldId}
                {...field}
              />
            ))}
          </ul>
        </ScrollableArea>
      </div>

      <Button
        className="text-md mt-6 w-full justify-center"
        onClick={() => {
          setConfigureStep(true);
        }}
        disabled={!fields.some((field) => field.selected === true)}>
        Save
      </Button>
    </>
  );
};

type EventTypeCardProps = TEventType & { userName: string; handleSelect: () => void };

const EventTypeCard: FC<EventTypeCardProps> = ({
  title,
  description,
  id,
  metadata,
  length,
  selected,
  slug,
  handleSelect,
  team,
  userName,
}) => {
  const parsedMetaData = EventTypeMetaDataSchema.safeParse(metadata);
  const durations =
    parsedMetaData.success &&
    parsedMetaData.data?.multipleDuration &&
    Boolean(parsedMetaData.data?.multipleDuration.length)
      ? [length, ...parsedMetaData.data?.multipleDuration?.filter((duration) => duration !== length)].sort()
      : [length];
  return (
    <div
      className="hover:bg-muted min-h-20 box-border flex w-full cursor-pointer select-none items-center space-x-4 px-4 py-3"
      onClick={() => handleSelect()}>
      <input
        id={`${id}`}
        checked={selected}
        className="bg-default border-default h-4 w-4 shrink-0 cursor-pointer rounded-[4px] border ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        type="checkbox"
      />
      <label htmlFor={`${id}`} className="cursor-pointer text-sm">
        <li>
          <div>
            <span className="text-default font-semibold ltr:mr-1 rtl:ml-1">{title}</span>{" "}
            <small className="text-subtle hidden font-normal sm:inline">
              /{team ? team.slug : userName}/{slug}
            </small>
          </div>
          {Boolean(description) && (
            <div className="text-subtle line-clamp-4 break-words  text-sm sm:max-w-[650px] [&>*:not(:first-child)]:hidden [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:text-blue-600">
              {description}
            </div>
          )}
          <div className="mt-2 flex flex-row flex-wrap gap-2">
            {Boolean(durations.length) &&
              durations.map((duration) => (
                <Badge key={`event-type-${id}-duration-${duration}`} variant="gray" startIcon={Clock}>
                  {duration}m
                </Badge>
              ))}
          </div>
        </li>
      </label>
    </div>
  );
};
