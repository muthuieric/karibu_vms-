"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/client-auth";

type VisitorOption = {
  id: string;
  name: string;
  gate_id?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  visitors?: VisitorOption[];
  selectedVisitor?: VisitorOption | null;
  onSaved?: () => void;
};

export default function GuardAccessNoteModal({
  open,
  onClose,
  visitors = [],
  selectedVisitor = null,