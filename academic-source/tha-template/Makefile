.PHONY: all clean

MAIN := Nayeem-Faisal-THA-Workspace

all: $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex THA-Abschlussarbeit.sty i18n/en.tex i18n/de.tex img/Logo.pdf
	latexmk -pdf -interaction=nonstopmode -halt-on-error $(MAIN).tex

clean:
	latexmk -CA $(MAIN).tex
