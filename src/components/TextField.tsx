import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { View, Text, TextInput, type TextInputProps } from "react-native";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

// Labeled text input wired to React Hook Form. Used across the auth screens.
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...inputProps
}: Props<T>) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-sm text-ink">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="rounded-xl border border-border bg-surface1 px-4 py-3.5 text-base text-ink"
            placeholderTextColor="#9C968A"
            onBlur={onBlur}
            onChangeText={onChange}
            value={(value as string) ?? ""}
            {...inputProps}
          />
        )}
      />
      {error ? <Text className="text-xs text-oxblood">{error}</Text> : null}
    </View>
  );
}
