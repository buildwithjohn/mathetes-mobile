import { useState } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  Pressable,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

// Labeled text input wired to React Hook Form. Password fields (secureTextEntry)
// get a show/hide eye toggle and safe defaults (no autocapitalize/autocorrect),
// which keeps the keyboard from mangling what you type.
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...inputProps
}: Props<T>) {
  const isSecure = !!inputProps.secureTextEntry;
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-sm text-ink">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="flex-row items-center rounded-xl border border-border bg-surface1">
            <TextInput
              className="flex-1 px-4 py-3.5 text-base text-ink"
              placeholderTextColor="#9C968A"
              onBlur={onBlur}
              onChangeText={onChange}
              value={(value as string) ?? ""}
              {...inputProps}
              {...(isSecure
                ? { autoCapitalize: "none" as const, autoCorrect: false }
                : {})}
              secureTextEntry={isSecure && !visible}
            />
            {isSecure ? (
              <Pressable
                onPress={() => setVisible((v) => !v)}
                className="px-4 py-3"
                hitSlop={8}
                accessibilityLabel={visible ? "Hide password" : "Show password"}
              >
                {visible ? (
                  <EyeOff color="#9C968A" size={20} />
                ) : (
                  <Eye color="#9C968A" size={20} />
                )}
              </Pressable>
            ) : null}
          </View>
        )}
      />
      {error ? <Text className="text-xs text-oxblood">{error}</Text> : null}
    </View>
  );
}
