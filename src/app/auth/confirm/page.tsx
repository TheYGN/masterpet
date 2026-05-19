import { confirmAction } from "./actions";

type Props = {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    invitation_token?: string;
  }>;
};

export default async function ConfirmPage({ searchParams }: Props) {
  const params = await searchParams;
  const { token_hash, type, invitation_token } = params;

  if (!token_hash || !type) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">הקישור אינו תקין</h1>
          <p className="text-gray-600">
            ייתכן שהקישור פג תוקף או שכבר נעשה בו שימוש.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg"
          >
            חזרה לדף הכניסה
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold">כניסה ל-MasterPet</h1>
        <p className="text-gray-600">
          לחצו על הכפתור למטה כדי להשלים את הכניסה לחשבון שלכם.
        </p>
        <form action={confirmAction}>
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          {invitation_token && (
            <input
              type="hidden"
              name="invitation_token"
              value={invitation_token}
            />
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium"
          >
            המשך לחשבון
          </button>
        </form>
      </div>
    </main>
  );
}
