import { ActionIcon, Button, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';

type FileFieldProps = {
  description: string;
  isBusy?: boolean;
  label: string;
  onBrowse: () => void;
  onDownloadExample?: () => void;
  placeholder: string;
  exampleTooltip?: string;
  value: string;
};

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      viewBox="0 0 16 16"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2.5V9.5M8 9.5L5.5 7M8 9.5L10.5 7M3 11.5H13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function FileField({
  description,
  isBusy = false,
  label,
  onBrowse,
  onDownloadExample,
  placeholder,
  exampleTooltip,
  value,
}: FileFieldProps) {
  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text fw={600}>{label}</Text>
        <Group gap="xs">
          {onDownloadExample ? (
            <Tooltip
              label={exampleTooltip ?? 'Download example template'}
              withArrow
            >
              <ActionIcon
                aria-label={exampleTooltip ?? 'Download example template'}
                onClick={onDownloadExample}
                size="sm"
                variant="light"
              >
                <DownloadIcon />
              </ActionIcon>
            </Tooltip>
          ) : null}
          <Button
            loading={isBusy}
            onClick={onBrowse}
            size="xs"
            variant="light"
          >
            Browse
          </Button>
        </Group>
      </Group>
      <TextInput
        placeholder={placeholder}
        readOnly
        value={value}
      />
      <Text
        c="dimmed"
        size="sm"
      >
        {description}
      </Text>
    </Stack>
  );
}
