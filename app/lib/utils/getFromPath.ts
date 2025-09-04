export default function getFromPath(path: string) {
  return path.split('/').filter(Boolean).pop();
}
