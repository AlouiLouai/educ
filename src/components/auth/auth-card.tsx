import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../utils";

type AuthCardProps = {
  title: string;
  description: string;
  onConnect: () => void;
  variant?: "card" | "plain";
  className?: string;
};

export default function AuthCard({
  title,
  description,
  onConnect,
  variant = "card",
  className,
}: AuthCardProps) {
  const Wrapper = variant === "card" ? Card : "div";
  return (
    <Wrapper className={cn(variant === "card" ? "mx-auto max-w-md" : null, className)}>
      <CardHeader className={variant === "plain" ? "px-0 pt-0" : undefined}>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted">{description}</p>
      </CardHeader>
      <CardContent className={variant === "plain" ? "px-0 pb-0" : undefined}>
        <Button onClick={onConnect} className="w-full">
          Se connecter
        </Button>
      </CardContent>
    </Wrapper>
  );
}
