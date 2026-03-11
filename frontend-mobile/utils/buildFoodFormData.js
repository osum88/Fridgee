export const buildFoodFormData = (foodData, imageFormData = null) => {
  const finalFormData = new FormData();

  // prekopiruje soubor z puvodnich formadata pokud existuje
  if (imageFormData?._parts) {
    const filePart = imageFormData._parts.find((part) => part[0] === "file");
    if (filePart) {
      finalFormData.append("file", filePart[1]);
    }
  }

  Object.keys(foodData).forEach((key) => {
    const value = foodData[key];
    if (value !== undefined) {
      let formattedValue;
      if (value instanceof Date) {
        formattedValue = value.toISOString();
      } else if (value === null || value === "null" || value === "") {
        formattedValue = "";
      } else {
        formattedValue = value.toString();
      }
      finalFormData.append(key, formattedValue);
    }
  });

  return finalFormData;
};
