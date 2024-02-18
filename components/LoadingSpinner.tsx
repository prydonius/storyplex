import { Spinner, SpinnerProps, XStack } from "tamagui";

export interface LoadingSpinnerProps {
  isLoading: boolean;
}
export default function LoadingSpinner({
  isLoading,
  children,
  ...props
}: React.PropsWithChildren<LoadingSpinnerProps & SpinnerProps>) {
  if (isLoading) {
    return (
      <XStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$purple10" {...props} />
      </XStack>
    );
  } else {
    return children;
  }
}
