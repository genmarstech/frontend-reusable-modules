import { ApiError, NetworkError } from "@/lib/api/client";
import { listOpsMembers } from "@/lib/api/ops/members";
import { getAccessToken, getCurrentUser } from "@/lib/auth/session";
import { ErrorState } from "@/components/ui/States";
import { AddMemberForm } from "./AddMemberForm";
import { RoleSelect } from "./RoleSelect";
import { changeRoleAction, reactivateMemberAction, removeMemberAction, suspendMemberAction } from "./actions";

export const instant = false;
export default async function OpsMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessToken = (await getAccessToken())!;

  let members;
  let currentUser;
  try {
    [members, currentUser] = await Promise.all([listOpsMembers(accessToken, slug), getCurrentUser()]);
  } catch (error) {
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Members</h2>
      <p className="text-xs text-neutral-500">
        Adding, changing a role, suspending or removing a member is owner-only — the backend rejects any of
        these from a manager or staff account even if this page is reached directly.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Since</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {members.results.map((member) => {
              const isSelf = currentUser?.id === member.user;
              return (
                <tr key={member.id}>
                  <td className="px-4 py-2">
                    {member.user_email}
                    {isSelf && <span className="ml-1 text-xs text-neutral-400">(you)</span>}
                  </td>
                  <td className="px-4 py-2">
                    <form action={changeRoleAction.bind(null, slug, member.id)}>
                      <RoleSelect defaultRole={member.role} />
                    </form>
                  </td>
                  <td className="px-4 py-2 capitalize">{member.status}</td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(member.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      {member.status === "suspended" ? (
                        <form action={reactivateMemberAction.bind(null, slug, member.id)}>
                          <button type="submit" className="text-xs text-neutral-600 hover:underline">
                            Reactivate
                          </button>
                        </form>
                      ) : (
                        <form action={suspendMemberAction.bind(null, slug, member.id)}>
                          <button type="submit" className="text-xs text-neutral-600 hover:underline">
                            Suspend
                          </button>
                        </form>
                      )}
                      <form action={removeMemberAction.bind(null, slug, member.id)}>
                        <button type="submit" className="text-xs text-red-600 hover:underline">
                          Remove
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-400">{members.count} total</p>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Add a member</h3>
        <p className="mt-1 text-xs text-neutral-500">
          By user id — there&apos;s no lookup by email (the backend has no endpoint that answers &quot;does this
          email have an account,&quot; by design, to avoid an account-enumeration oracle). Find a user&apos;s id via the
          Customers page if they&apos;ve already ordered here, or ask them for it directly.
        </p>
        <div className="mt-3">
          <AddMemberForm storeSlug={slug} />
        </div>
      </div>
    </div>
  );
}
