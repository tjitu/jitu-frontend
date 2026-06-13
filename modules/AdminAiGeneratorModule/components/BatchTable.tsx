"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, Play, Square } from "lucide-react";
import { AiBatch } from "@/lib/api/AdminAiApi";
import { BatchTableProps } from "../interface";
import { StatusBadge } from "./StatusBadge";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function BatchTable({
  batches,
  isLoading,
  selectedBatchId,
  onView,
  onStart,
  onCancel,
}: BatchTableProps) {
  const canStart = (batch: AiBatch) =>
    ["DRAFT", "FAILED", "CANCELLED"].includes(batch.status);
  const canCancel = (batch: AiBatch) =>
    ["QUEUED", "RUNNING"].includes(batch.status);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Generation Batches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Batch</TableHead>
                <TableHead>Tryout/Subtest</TableHead>
                <TableHead className="text-center">Requested</TableHead>
                <TableHead className="text-center">Done</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat batch AI...
                    </div>
                  </TableCell>
                </TableRow>
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Belum ada generation batch.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    className={
                      selectedBatchId === batch.id ? "bg-primary/5" : undefined
                    }
                  >
                    <TableCell>
                      <div className="font-medium">{batch.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {batch.subject} - {batch.topic}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {batch.tryoutTitle || batch.tryoutId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {batch.subtestName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {batch.requestedCount || batch.totalQuestions}
                    </TableCell>
                    <TableCell className="text-center">
                      {batch.completedCount}
                    </TableCell>
                    <TableCell className="text-center text-red-600">
                      {batch.failedCount}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={batch.status} />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(batch.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onView(batch)}
                          title="View batch"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => onStart(batch)}
                          disabled={!canStart(batch)}
                          title="Start generation"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => onCancel(batch)}
                          disabled={!canCancel(batch)}
                          title="Cancel generation"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
