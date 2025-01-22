function checkId(id) {
  const idCheckRegex = /^[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]+?$/;
  return id && idCheckRegex.test(id);
}

function extractIdFromString(inputString) {
  // Может быть это имя файла?
  const fileNameRegex = /-SigexId(.+?)\./;
  if (fileNameRegex.test(inputString)) {
    const [, id] = fileNameRegex.exec(inputString);
    if (checkId(id)) {
      return id;
    }
  }

  // Может быть это имя файла без расширения?
  const extensionlessFileNameRegex = /-SigexId(.+?)$/;
  if (extensionlessFileNameRegex.test(inputString)) {
    const [, id] = extensionlessFileNameRegex.exec(inputString);
    if (checkId(id)) {
      return id;
    }
  }

  // Может быть это ссылка?
  try {
    const id = (new URL(inputString)).searchParams.get('id');
    if (checkId(id)) {
      return id;
    }
  } catch (err) { /* ignore */ }

  // Ничего не подходит
  return '';
}

// eslint-disable-next-line no-unused-vars
function removeIdFromString(inputString) {
  const id = extractIdFromString(inputString);

  return inputString.replace(`-SigexId${id}`, '');
}

// eslint-disable-next-line no-unused-vars
function buildRecommendedFileNames(title, documentId) {
  const titleParts = title.split('.');

  let recommendedTitle;
  let recommendedTitleWithoutExtension;
  if (titleParts.length === 1) {
    recommendedTitle = `${title}-SigexId${documentId}`;
    recommendedTitleWithoutExtension = recommendedTitle;
  } else {
    const extension = titleParts.pop();
    recommendedTitleWithoutExtension = `${titleParts.join('.')}-SigexId${documentId}`;
    recommendedTitle = `${recommendedTitleWithoutExtension}.${extension}`;
  }

  return { recommendedTitle, recommendedTitleWithoutExtension };
}
