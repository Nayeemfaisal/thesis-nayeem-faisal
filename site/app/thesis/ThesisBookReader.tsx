"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PDF_URL = "/nayeem-faisal-thesis.pdf";
const PDFJS_URL = "/pdf.min.mjs";

type PdfViewport = { width: number; height: number };
type RenderTask = { promise: Promise<void>; cancel: () => void };
type PdfPage = {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (options: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
    transform?: number[];
  }) => RenderTask;
};
type PDFDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy: () => Promise<void>;
};

type FlipDirection = "next" | "previous" | null;

export default function ThesisBookReader() {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(86);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [singlePage, setSinglePage] = useState(false);
  const [flipDirection, setFlipDirection] = useState<FlipDirection>(null);
  const leftCanvas = useRef<HTMLCanvasElement>(null);
  const rightCanvas = useRef<HTMLCanvasElement>(null);
  const readerStage = useRef<HTMLDivElement>(null);
  const renderTasks = useRef<RenderTask[]>([]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 820px)");
    const update = () => setSinglePage(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    let loadedDocument: PDFDocumentProxy | null = null;

    async function loadPdf() {
      try {
        const pdfjs = await import(/* @vite-ignore */ PDFJS_URL) as {
          GlobalWorkerOptions: { workerSrc: string };
          getDocument: (options: { url: string }) => { promise: Promise<PDFDocumentProxy> };
        };
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjs.getDocument({ url: PDF_URL });
        loadedDocument = await loadingTask.promise;
        if (!active) {
          await loadedDocument.destroy();
          return;
        }
        setDocument(loadedDocument);
        setTotalPages(loadedDocument.numPages);
        setLoading(false);
      } catch {
        if (active) {
          setError("The page reader could not start. The complete PDF is still available above.");
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      active = false;
      renderTasks.current.forEach((task) => task.cancel());
      renderTasks.current = [];
      void loadedDocument?.destroy();
    };
  }, []);

  const renderPage = useCallback(
    async (pageNumber: number, canvas: HTMLCanvasElement | null) => {
      if (!document || !canvas || pageNumber < 1 || pageNumber > totalPages) return;
      const pdfPage = await document.getPage(pageNumber);
      const baseScale = singlePage ? 1.45 : 1.08;
      const viewport = pdfPage.getViewport({ scale: baseScale });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const task = pdfPage.render({
        canvas,
        canvasContext: context,
        viewport,
        transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
      });
      renderTasks.current.push(task);
      try {
        await task.promise;
      } catch (renderError) {
        if (!(renderError instanceof Error) || renderError.name !== "RenderingCancelledException") {
          throw renderError;
        }
      } finally {
        renderTasks.current = renderTasks.current.filter((item) => item !== task);
      }
    },
    [document, singlePage, totalPages],
  );

  useEffect(() => {
    if (!open || !document) return;
    renderTasks.current.forEach((task) => task.cancel());
    renderTasks.current = [];

    const clearPage = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const context = canvas.getContext("2d");
      canvas.width = 760;
      canvas.height = 1075;
      canvas.style.aspectRatio = "210 / 297";
      if (context) {
        context.fillStyle = "#f8f6ef";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (singlePage) {
      void renderPage(page, rightCanvas.current);
      return;
    }

    if (page === 1) {
      clearPage(leftCanvas.current);
      void renderPage(1, rightCanvas.current);
    } else {
      void renderPage(page, leftCanvas.current);
      if (page + 1 <= totalPages) {
        void renderPage(page + 1, rightCanvas.current);
      } else {
        clearPage(rightCanvas.current);
      }
    }
  }, [document, open, page, renderPage, singlePage, totalPages]);

  const turn = useCallback(
    (direction: Exclude<FlipDirection, null>) => {
      const step = singlePage ? 1 : 2;
      const nextPage = direction === "next"
        ? (singlePage ? Math.min(totalPages, page + step) : page === 1 ? 2 : Math.min(totalPages, page + step))
        : (singlePage ? Math.max(1, page - step) : page <= 2 ? 1 : Math.max(2, page - step));
      if (nextPage === page) return;
      setFlipDirection(direction);
      setPage(nextPage);
      window.setTimeout(() => setFlipDirection(null), 520);
    },
    [page, singlePage, totalPages],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") turn("next");
      if (event.key === "ArrowLeft" || event.key === "PageUp") turn("previous");
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, turn]);

  const pageLabel = singlePage || page === 1 || page === totalPages
    ? `Page ${page} of ${totalPages}`
    : `Pages ${page}-${Math.min(page + 1, totalPages)} of ${totalPages}`;

  const jumpToPage = (value: number) => {
    const safePage = Math.min(totalPages, Math.max(1, value));
    setPage(singlePage || safePage === 1 ? safePage : safePage % 2 === 0 ? safePage : safePage - 1);
  };

  const enterFullscreen = async () => {
    if (readerStage.current?.requestFullscreen) await readerStage.current.requestFullscreen();
  };

  return (
    <div className={`book-reader ${open ? "is-open" : "is-closed"}`} ref={readerStage}>
      {!open ? (
        <button className="book-closed" type="button" onClick={() => setOpen(true)} aria-label="Open the thesis book">
          <span className="book-cover-spine" aria-hidden="true" />
          <img src="/thesis-book-cover.png" alt="White hardcover of Nayeem Faisal's bachelor thesis" />
          <span className="book-open-cue"><b>OPEN THE BOOK</b><small>Interactive 86-page edition</small></span>
        </button>
      ) : (
        <>
          <div className="book-toolbar">
            <div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close the book">Close book</button>
              <button type="button" onClick={enterFullscreen}>Full screen</button>
            </div>
            <p aria-live="polite">{pageLabel}</p>
            <div>
              <button type="button" onClick={() => turn("previous")} disabled={page === 1} aria-label="Previous page">← Previous</button>
              <button type="button" onClick={() => turn("next")} disabled={page >= totalPages} aria-label="Next page">Next →</button>
            </div>
          </div>

          <div className={`book-spread ${flipDirection ? `is-flipping-${flipDirection}` : ""}`}>
            {loading && <div className="book-status">Preparing the book…</div>}
            {error && <div className="book-status is-error">{error}</div>}
            {!singlePage && <div className={`book-page book-page-left ${page === 1 ? "is-blank" : ""}`}><canvas ref={leftCanvas} role="img" aria-label={page === 1 ? "Inside front cover" : `Thesis page ${page}`} /></div>}
            <div className="book-gutter" aria-hidden="true" />
            <div className="book-page book-page-right"><canvas ref={rightCanvas} role="img" aria-label={`Thesis page ${singlePage ? page : page === 1 ? 1 : Math.min(page + 1, totalPages)}`} /></div>
          </div>

          <div className="book-progress">
            <span>01</span>
            <input
              type="range"
              min="1"
              max={totalPages}
              value={page}
              onChange={(event) => jumpToPage(Number(event.target.value))}
              aria-label="Jump to a thesis page"
            />
            <span>{String(totalPages).padStart(2, "0")}</span>
          </div>
          <p className="book-help">Use the controls, slider, or keyboard arrow keys to turn pages.</p>
        </>
      )}
    </div>
  );
}
