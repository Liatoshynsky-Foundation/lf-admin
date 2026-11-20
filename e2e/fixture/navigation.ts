// Only the surrounding page header needs the Next router in this isolated browser fixture.
export const useRouter = () => ({ push: () => undefined });
