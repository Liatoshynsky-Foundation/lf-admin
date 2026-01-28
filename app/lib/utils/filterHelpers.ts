export function filterBySearch<T>(items: T[], searchValue: string, searchFields: (keyof T)[]): T[] {
  if (!searchValue.trim()) {
    return items;
  }

  const lowerSearchValue = searchValue.toLowerCase();

  return items.filter((item) =>
    searchFields.some((field) => {
      const fieldValue = item[field];

      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(lowerSearchValue);
      }

      return false;
    })
  );
}

export function matchesSearch<T>(item: T, searchValue: string, searchFields: (keyof T)[]): boolean {
  if (!searchValue.trim()) {
    return true;
  }

  const lowerSearchValue = searchValue.toLowerCase();

  return searchFields.some((field) => {
    const fieldValue = item[field];

    if (typeof fieldValue === 'string') {
      return fieldValue.toLowerCase().includes(lowerSearchValue);
    }

    return false;
  });
}

export function sortByDateAndName<T extends { createdAt: string; filename: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return a.filename.localeCompare(b.filename);
  });
}
