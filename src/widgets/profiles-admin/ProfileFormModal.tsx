"use client";

import { useState, type FormEvent } from "react";
import { roleLabels, roleSchema, type Role } from "@/entities/profile/model";
import { useUpdateProfile } from "@/entities/profile/queries";
import type { PublicProfile } from "@/entities/profile/api";
import { Modal } from "@tailadmin/components/ui/modal";
import Button from "@tailadmin/components/ui/button/Button";
import Label from "@tailadmin/components/form/Label";

const ROLES = roleSchema.options;
const control =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export interface ProfileFormModalProps {
  profile: PublicProfile | null;
  onClose: () => void;
}

export function ProfileFormModal({ profile, onClose }: ProfileFormModalProps) {
  return (
    <Modal isOpen={profile !== null} onClose={onClose} className="m-4 max-w-lg p-6">
      {profile && <ProfileFormBody key={profile.id} profile={profile} onClose={onClose} />}
    </Modal>
  );
}

interface ProfileFormBodyProps {
  profile: PublicProfile;
  onClose: () => void;
}

function ProfileFormBody({ profile, onClose }: ProfileFormBodyProps) {
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [role, setRole] = useState<Role>(profile.role);
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (updateProfile.isPending) return;
    setErro(null);
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        patch: { name, username, role, password: password || undefined },
      });
      onClose();
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível salvar o perfil.");
    }
  }

  return (
    <form onSubmit={salvar}>
      <h4 className="mb-6 text-lg font-semibold text-gray-800">Editar perfil</h4>

      <div className="mb-5">
        <Label htmlFor="editar-nome">Nome</Label>
        <input
          id="editar-nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoFocus
          className={control}
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="editar-usuario">Login de usuário</Label>
        <input
          id="editar-usuario"
          autoCapitalize="none"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          className={control}
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="editar-papel">Papel</Label>
        <select
          id="editar-papel"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          className={control}
        >
          {ROLES.map((opcao) => (
            <option key={opcao} value={opcao}>
              {roleLabels[opcao]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <Label htmlFor="editar-senha">Nova senha</Label>
        <input
          id="editar-senha"
          type="password"
          minLength={6}
          autoComplete="new-password"
          placeholder="Deixe em branco para manter"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={control}
        />
      </div>

      {erro && (
        <p role="alert" className="mb-5 text-sm text-error-600">
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
