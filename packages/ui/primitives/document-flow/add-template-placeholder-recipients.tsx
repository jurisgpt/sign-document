'use client';

import React, { useId, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { nanoid } from '@documenso/lib/universal/id';
import { TemplateField, TemplateRecipient } from '@documenso/prisma/client';
import { Button } from '@documenso/ui/primitives/button';
import { FormErrorMessage } from '@documenso/ui/primitives/form/form-error-message';
import { Input } from '@documenso/ui/primitives/input';
import { Label } from '@documenso/ui/primitives/label';

import {
  TAddTemplatePlacholderRecipientsFormSchema,
  ZAddTemplatePlacholderRecipientsFormSchema,
} from './add-template-placeholder-recipients.types';
import {
  DocumentFlowFormContainerActions,
  DocumentFlowFormContainerContent,
  DocumentFlowFormContainerFooter,
  DocumentFlowFormContainerStep,
} from './document-flow-root';
import { DocumentFlowStep } from './types';

export type AddTemplatePlaceholderRecipientsFormProps = {
  documentFlow: DocumentFlowStep;
  recipients: TemplateRecipient[];
  fields: TemplateField[];
  numberOfSteps: number;
  onSubmit: (_data: TAddTemplatePlacholderRecipientsFormSchema) => void;
};

export const AddTemplatePlaceholderRecipientsFormPartial = ({
  documentFlow,
  numberOfSteps,
  recipients,
  fields: _fields,
  onSubmit,
}: AddTemplatePlaceholderRecipientsFormProps) => {
  const initialId = useId();
  const [placeholderRecipientCount, setPlaceholderRecipientCount] = useState(1);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TAddTemplatePlacholderRecipientsFormSchema>({
    resolver: zodResolver(ZAddTemplatePlacholderRecipientsFormSchema),
    defaultValues: {
      signers:
        recipients.length > 0
          ? recipients.map((recipient) => ({
              nativeId: recipient.id,
              formId: String(recipient.id),
              name: recipient.placeholder,
              email: recipient.email,
            }))
          : [
              {
                formId: initialId,
                name: `John Doe`,
                email: `johndoe@documenso.com`,
              },
            ],
    },
  });

  const onFormSubmit = handleSubmit(onSubmit);

  const {
    append: appendSigner,
    fields: signers,
    remove: removeSigner,
  } = useFieldArray({
    control,
    name: 'signers',
  });

  const onAddPlaceholderRecipient = () => {
    setPlaceholderRecipientCount(placeholderRecipientCount + 1);

    appendSigner({
      formId: nanoid(12),
      name: `John Doe ${placeholderRecipientCount}`,
      email: `johndoe${placeholderRecipientCount}@documenso.com`,
    });
  };

  const onRemoveSigner = (index: number) => {
    removeSigner(index);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      onAddPlaceholderRecipient();
    }
  };

  return (
    <>
      <DocumentFlowFormContainerContent>
        <div className="flex w-full flex-col gap-y-4">
          <AnimatePresence>
            {signers.map((signer, index) => (
              <motion.div
                key={signer.id}
                data-native-id={signer.nativeId}
                className="flex flex-wrap items-end gap-x-4"
              >
                <div className="flex-1">
                  <Label htmlFor={`signer-${signer.id}-email`}>
                    Email
                    <span className="text-destructive ml-1 inline-block font-medium">*</span>
                  </Label>

                  <Controller
                    control={control}
                    name={`signers.${index}.email`}
                    render={({ field }) => (
                      <Input
                        id={`signer-${signer.id}-email`}
                        type="email"
                        className="bg-background mt-2"
                        disabled={isSubmitting}
                        onKeyDown={onKeyDown}
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`signer-${signer.id}-name`}>Name</Label>

                  <Controller
                    control={control}
                    name={`signers.${index}.name`}
                    render={({ field }) => (
                      <Input
                        id={`signer-${signer.id}-name`}
                        type="text"
                        className="bg-background mt-2"
                        disabled={isSubmitting}
                        onKeyDown={onKeyDown}
                        {...field}
                      />
                    )}
                  />
                </div>

                <div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center text-slate-500 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting || signers.length === 1}
                    onClick={() => onRemoveSigner(index)}
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>

                <div className="w-full">
                  <FormErrorMessage className="mt-2" error={errors.signers?.[index]?.email} />
                  <FormErrorMessage className="mt-2" error={errors.signers?.[index]?.name} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <FormErrorMessage
          className="mt-2"
          // Dirty hack to handle errors when .root is populated for an array type
          error={'signers__root' in errors && errors['signers__root']}
        />

        <div className="mt-4">
          <Button type="button" disabled={isSubmitting} onClick={() => onAddPlaceholderRecipient()}>
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Placeholder Recipient
          </Button>
        </div>
      </DocumentFlowFormContainerContent>

      <DocumentFlowFormContainerFooter>
        <DocumentFlowFormContainerStep
          title={documentFlow.title}
          step={documentFlow.stepIndex}
          maxStep={numberOfSteps}
        />

        <DocumentFlowFormContainerActions
          loading={isSubmitting}
          disabled={isSubmitting}
          onGoBackClick={documentFlow.onBackStep}
          onGoNextClick={() => void onFormSubmit()}
        />
      </DocumentFlowFormContainerFooter>
    </>
  );
};
