import { Directory, File, Paths } from "expo-file-system";

//stahne fotku z url a ulozi ji do pameti aplikace
export const downloadImage = async (
  remoteUrl,
  folder,
  fileName,
  rewrite = false
) => {
  if (!remoteUrl || remoteUrl === "none") return null;

  // const profileDir = new Directory(localPath);
  // const contents = profileDir.list();

  // for (const item of contents) {
  //   console.log(item.name);
  // }

  try {
    //vytvori slozku
    const dir = new Directory(Paths.document.uri, folder);
    if (!dir.exists) {
      dir.create();
    }

    //pokud soubor neexistuje tak ho vytvori, pokud je rewrite true, pak puvodni smaze a vytvori novy
    const file = new File(dir, fileName);
    if (!file.exists || rewrite) {
      if (rewrite && file.exists) {
        file.delete();
      }
      await File.downloadFileAsync(remoteUrl, file);
      console.log(`Image download: ${file.uri}`);
    } else {
      console.log(`Image is existing: ${file.uri}`);
    }

    return `${file.uri}`;
  } catch (error) {
    console.warn("Download failed:", error);
    return null;
  }
};

//stahne fotku z url a ulozi ji do pameti aplikace
export const moveFile = async (uriFile, folder, fileName, rewrite = false) => {
  if (!uriFile) return null;
  try {
    //vytvori slozku
    const dir = new Directory(Paths.document.uri, folder);
    if (!dir.exists) {
      dir.create();
    }

    //puvodni soubor
    const originalFile = new File(uriFile);
    //pokud soubor neexistuje tak ho vytvori, pokud je rewrite true, pak puvodni smaze a vytvori novy
    const newFile = new File(dir, fileName);
    if (!newFile.exists || rewrite) {
      if (rewrite && newFile.exists) {
        newFile.delete();
      }
      originalFile.move(newFile);

      console.log(`File moved: ${newFile.uri}`);
    } else {
      console.log(`File is existing: ${newFile.uri}`);
    }

    return `${newFile.uri}`;
  } catch (error) {
    console.warn("File move failed:", error);
    return null;
  }
};

//vreti true pokud file existuje
export const isFileExist = (path, fileName) => {
  const file = new File(path, fileName);
  return file.exists ? true : false;
};
