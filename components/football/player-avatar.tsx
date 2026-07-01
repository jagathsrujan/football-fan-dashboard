import Image from "next/image";

type PlayerAvatarProps = {
  name: string;
  teamAccent: string;
  photoUrl?: string | null;
  size?: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function PlayerAvatar({ name, photoUrl, size = 40, teamAccent }: PlayerAvatarProps) {
  if (photoUrl) {
    return <Image src={photoUrl} alt={`${name} avatar`} width={size} height={size} className="rounded-full object-cover" />;
  }

  return (
    <div
      aria-label={`${name} avatar`}
      className="grid shrink-0 place-items-center rounded-full font-display font-semibold text-primary"
      style={{
        width: size,
        height: size,
        backgroundColor: `${teamAccent}33`,
        border: `1px solid ${teamAccent}`,
      }}
    >
      {initials(name)}
    </div>
  );
}
