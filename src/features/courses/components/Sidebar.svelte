<script lang="ts">
  import { BookOpen, Users, User } from "lucide-svelte";
  import { page } from "$app/state";
  import { cn } from "../../common/ui";

  const items = [
    { href: "/", label: "Semua Kursus", icon: BookOpen },
    { href: "/users", label: "Pengguna", icon: Users },
    { href: "/profile", label: "Profil", icon: User },
  ];

  const isActive = (href: string) =>
    href === "/" ? page.url.pathname === "/" || page.url.pathname.startsWith("/courses") : page.url.pathname.startsWith(href);
</script>

<nav aria-label="Menu utama" class="border-b border-slate-200 bg-white md:w-60 md:shrink-0 md:border-r md:border-b-0">
  <ul class="flex gap-1 overflow-x-auto p-2 md:sticky md:top-16 md:flex-col md:p-4">
    {#each items as item (item.href)}
      <li>
        <a
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          class={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-700",
            isActive(item.href) ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
          )}
        >
          <item.icon size={18} aria-hidden="true" />
          {`${item.label}`}
        </a>
      </li>
    {/each}
  </ul>
</nav>
