\ProvidesClass{stadgar}[2012/03/15 Stadgar]
\NeedsTeXFormat{LaTeX2e}

\LoadClass[11pt, a4paper]{article}

\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage[swedish]{babel}
\RequirePackage{graphicx}
\RequirePackage{fancyhdr}
\RequirePackage[margin=1in]{geometry}

%%% Se till att ha svenska avstavningsregler installerade innan du kompilerar 
%%% Stadgarna! På ett Riktigt Operativsystem kan man åstadkomma detta genom 
%%% att installera paketet "texlive-lang-swedish" eller motsvarande.

%%% PROBLEM:
%%%
%%% * itemize-listor tar för mycket plats. Vi måste komma på nåt sätt att 
%%%   krympa dem lite. /JF
%%%

%------------------------------------
% Fulhaxx
%------------------------------------

\newcommand{\thisparagraph}{%
	\S \arabic{lvl1}.\arabic{lvl2}.\arabic{lvl3}%
}

%------------------------------------
% Enumitem.sty
%------------------------------------

\RequirePackage{enumitem}

\setlist[itemize]{noitemsep, topsep=0pt}
\setlist[enumerate]{noitemsep, topsep=0pt}

%------------------------------------
% Längder & sånt
%------------------------------------

\setlength{\parskip}{1.5em}

%------------------------------------
% Enumtjafs
%------------------------------------

\renewcommand{\theenumi}{\alph{enumi}}
\renewcommand{\theenumii}{\roman{enumii}}

%------------------------------------
% Hjälpkommandon
%------------------------------------

\newcommand{\@tagna}{16 november 1988}

\newcommand{\tagna}[1]{
	\renewcommand{\@tagna}{#1}
}

\newcommand{\@revid}{\today}

\newcommand{\revid}[1]{
	\renewcommand{\@revid}{#1}
}

%------------------------------------
% Prelim
%------------------------------------

\title{Stadgar för F-teknologsektionen inom TLTH}
\author{Hilbert Älg}
\date{\@revid}

%------------------------------------
% Header och footer layout
%------------------------------------
\setlength{\headheight}{15.2pt}
\pagestyle{fancy}


\lhead{\@title}
\chead{}
\rhead{Rev. \@revid}



\lfoot{}
\cfoot{\thepage}
\rfoot{}


	
	

%------------------------------------
% Layout på titelsidan
%------------------------------------

\renewcommand{\maketitle}{
	\begin{titlepage}
		\vspace*{8em}
		\begin{center}
			\rule{\linewidth}{0.5mm} \\
			\vspace*{0.5em}
			\Large{\textbf{F-teknologsektionen inom TLTH}} \\
			\vspace*{0.5em}
			\Huge{\textbf{Stadgar}} \\
			\vspace*{0.5em}
			\large{
			\begin{tabular}{l r}
			Tagna vid terminsmötet & \@tagna \\
			Senast reviderade      & \@revid
			\end{tabular}
			} \\
			\vspace*{0.5em}
			\rule{\linewidth}{0.5mm}
			\vfill
%			\includegraphics[width=0.25\textwidth]{f.pdf}
%			\includegraphics[width=0.60\textwidth,angle=\pdfuniformdeviate 360]{fsek.pdf}
			\includegraphics[width=0.60\textwidth]{fsek.pdf}
			\vfill
		\end{center}
	\end{titlepage}
}

%------------------------------------
% Innehållsförteckning
%------------------------------------
\newcommand{\usetoc}{

}


%Counters för paragraferna
\newcounter{lvl1}		%kap
\newcounter{lvl2}[lvl1] %parg
\newcounter{lvl3}[lvl2] %subparg

%------------------------------------
% \parg{#1}{#2}
%
% Kommando för att skapa en paragraf
%    #1: titel på paragrafen
%    #2: paragrafens innehåll
%------------------------------------  
\newcommand{\parg}[2]{
	\noindent
%	\label{parg:#1}
	\begin{minipage}[t]{0.08\textwidth}
		\hspace*{0.05\textwidth}
		\refstepcounter{lvl2}
		\S \arabic{lvl1}.\arabic{lvl2}
	\end{minipage}
	\begin{minipage}[t]{0.22\textwidth}
		\emph{#1}
	\end{minipage}
	\begin{minipage}[t]{0.68\textwidth}
		\setlength{\parskip}{0.7em}
		#2
	\end{minipage}
	
	%OBS! Whitespace-rad ovan för att garantera att det alltid är mellanrum mellan paragrafer!
}

%------------------------------------
% \subparg{#1}{#2}
%
% Kommando för att skapa en subparagraf
%    #1: titel på paragrafen
%    #2: paragrafens innehåll
%------------------------------------  
\newcommand{\subparg}[2]{
	\noindent
%	\label{subparg:#1}
	\begin{minipage}[t]{0.08\textwidth}
		\hspace*{0.05\textwidth}
		\refstepcounter{lvl3}
		\S \arabic{lvl1}.\arabic{lvl2}.\arabic{lvl3}
	\end{minipage}
	\begin{minipage}[t]{0.22\textwidth}
		{\emph{#1}}
	\end{minipage}
	\begin{minipage}[t]{0.68\textwidth}
		\setlength{\parskip}{0.7em}
		{#2}
	\end{minipage}
	
	%OBS! Whitespace-rad ovan för att garantera att det alltid är mellanrum mellan paragrafer!
}


%------------------------------------
% \kap{#1}
%
% Kommando för att skapa ett kapitel
%    #1: kapitlets innehåll
%------------------------------------ 
\newcommand{\kap}[1]{
	\noindent
%	\label{kap:#1}
	\refstepcounter{lvl1}
	\begin{minipage}[t]{0.30\textwidth}
		{\LARGE\textbf{Kapitel \arabic{lvl1}}}
	\end{minipage}
	\begin{minipage}[t]{0.68\textwidth}
		{\LARGE\textbf{#1}}
	\end{minipage}
	
	\nopagebreak
	%OBS! Whitespace-rad ovan för att garantera att det alltid är mellanrum mellan kapitel!
}

\AtEndDocument{
\vfill
\flushright
\emph{Lund, den \@revid} \\ \ \\
\includegraphics[width=0.15\textwidth]{fsek.pdf}
\vfill
}
