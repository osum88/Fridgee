export const invalidateQueries = (queryClient, keys = []) => {
  return Promise.all(
    keys.map((key) =>
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] })
    )
  );
};