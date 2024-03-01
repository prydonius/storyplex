// https://github.com/RebeccaStevens/deepmerge-ts/discussions/25
import {
  deepmergeCustom,
  type DeepMergeLeaf,
  type DeepMergeMergeFunctionsURIs,
} from "deepmerge-ts";

export const deepmergeDefined = deepmergeCustom<{
  DeepMergeOthersURI: "DeepMergeLeafNoUndefinedOverrideURI";
}>({
  mergeOthers: (values, utils) => {
    return utils.defaultMergeFunctions.mergeOthers(
      values.filter((v) => v !== undefined),
    );
  },
});

declare module "deepmerge-ts" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    in out M,
  > {
    readonly DeepMergeLeafNoUndefinedOverrideURI: DeepMergeLeafNoUndefinedOverride<Ts>;
  }
}

type DeepMergeLeafNoUndefinedOverride<Ts extends ReadonlyArray<unknown>> =
  DeepMergeLeaf<FilterOutUnderfined<Ts>>;

type FilterOutUnderfined<T extends ReadonlyArray<unknown>> =
  FilterOutUnderfinedHelper<T, []>;

type FilterOutUnderfinedHelper<
  T extends ReadonlyArray<unknown>,
  Acc extends ReadonlyArray<unknown>,
> = T extends readonly []
  ? Acc
  : T extends readonly [infer Head, ...infer Rest]
    ? Head extends undefined
      ? FilterOutUnderfinedHelper<Rest, Acc>
      : FilterOutUnderfinedHelper<Rest, [...Acc, Head]>
    : T;
