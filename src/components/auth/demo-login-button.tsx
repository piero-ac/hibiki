import { signInDemoUser } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function DemoLoginButton() {
	return (
		<form action={signInDemoUser}>
			<Button type="submit" variant="secondary" size="sm">
				Try Demo
			</Button>
		</form>
	);
}
