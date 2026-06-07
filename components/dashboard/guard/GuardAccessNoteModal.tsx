"use client";

import { useEffect, useState } from "react";
import { ClipboardList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/client-auth";
import type { Visitor } from "@/types/guard";

type GuardAccessNoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  visitor?: Visitor