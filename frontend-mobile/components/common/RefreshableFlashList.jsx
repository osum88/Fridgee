import React, { useCallback, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";

const REFRESH_COOLDOWN_MS = 10_000;

//flsh list s refreshem
const RefreshableFlashListComponent = ({ refetch, data, ...props }) => {
  const [lastManualRefetch, setLastManualRefetch] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const colors = useThemeColor();

  const handleManualRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastManualRefetch < REFRESH_COOLDOWN_MS) return;
    setLastManualRefetch(now);
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [lastManualRefetch, refetch]);

  return (
    <FlashList
      data={data}
      refreshControl={
        <RefreshControl
          refreshing={isManualRefreshing}
          onRefresh={handleManualRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressViewOffset={responsiveSize.vertical(10)}
        />
      }
      {...props}
    />
  );
};

export const RefreshableFlashList = React.memo(RefreshableFlashListComponent);