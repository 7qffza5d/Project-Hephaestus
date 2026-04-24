// app/components/AuthorDisplay.tsx
interface Author {
  id: string;
  name: string;
}

interface AuthorDisplayProps {
  author: Author;
  pseudonym: string | null;
  isAdmin: boolean;
}

export default function AuthorDisplay({
  author,
  pseudonym,
  isAdmin,
}: AuthorDisplayProps) {
  if (isAdmin && pseudonym) {
    return (
      <span className="text-sm text-gray-400">
        {author.name}{" "}
        <span className="text-gray-500">
          (as <span className="italic text-gray-300">{pseudonym}</span>)
        </span>
      </span>
    );
  }

  if (isAdmin) {
    return <span className="text-sm text-gray-400">{author.name}</span>;
  }

  // Student view — show pseudonym if set, otherwise real name
  return (
    <span className="text-sm text-gray-400">
      {pseudonym ?? author.name}
    </span>
  );
}