import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const OLD_ID = "c35c1bbe-de9f-4578-8e0f-37ad8b2366cd"; // lidiasilvinad
  const NEW_ID = "75f3b7f6-06d8-4ba4-8d32-852d51501173"; // vilaolimpica.cmvomz
  const log: any = {};

  // 1) Set password on new account + confirm
  const { error: pErr } = await admin.auth.admin.updateUserById(NEW_ID, {
    password: "EBENEZER2026!",
    email_confirm: true,
  });
  log.passwordUpdate = pErr?.message || "ok";

  // 2) Transfer admin role: remove any role rows referencing old, add admin for new (if missing)
  const { error: delRoleErr } = await admin.from("user_roles").delete().eq("user_id", OLD_ID);
  log.delOldRoles = delRoleErr?.message || "ok";

  const { data: existRole } = await admin.from("user_roles").select("id").eq("user_id", NEW_ID).eq("role", "admin").maybeSingle();
  if (!existRole) {
    const { error: insErr } = await admin.from("user_roles").insert({ user_id: NEW_ID, role: "admin" });
    log.addNewAdmin = insErr?.message || "ok";
  } else {
    log.addNewAdmin = "already admin";
  }

  // 3) Delete the old user account
  const { error: delUserErr } = await admin.auth.admin.deleteUser(OLD_ID);
  log.deleteOldUser = delUserErr?.message || "ok";

  return new Response(JSON.stringify(log, null, 2), { headers: { "Content-Type": "application/json" } });
});
