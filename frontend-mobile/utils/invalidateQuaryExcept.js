
export const invalidateQuaryExcept = (queryClient, key, ...args) => {
  //vrati vsechny quarries s timto klicem
  const allQueries = queryClient.getQueryCache().findAll({
    queryKey: [key],
  });

  //pak vsechny krome aktulniho udela nevalidnim
  allQueries.forEach((query) => {
    const queryKey = query.queryKey;
    const isDifferent = args.some((arg, index) => queryKey[index + 1] !== arg);
    if (isDifferent) {
      queryClient.invalidateQueries({ queryKey });
    }
  });
};
