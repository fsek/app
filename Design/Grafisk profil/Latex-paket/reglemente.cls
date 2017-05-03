%%% -------------------------------------- %%%
%%%  REGLEMENTE class by Fabian Ågren Pi11 %%%

%%%  Modified from STADGA class written    %%%
%%%  by Linus Hammarlund Pi10 and          %%%
%%%  Johan Förberg F10					   %%%
%%%----------------------------------------%%%

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{reglemente}[2014/02/05 Reglemente class]

\LoadClass[a4paper, 11pt]{article}

%
\RequirePackage[T1]{fontenc} 

% Set Latin Modern ss the default serif.
\RequirePackage{lmodern}

% Set Helvetica as the default sans-serif.
\RequirePackage{helvet}

% Get images so we can put the F f in flowing text.
\RequirePackage{graphicx}

% Get Swedish dates and standard strings.
\RequirePackage[swedish]{babel}

% Allow unicode ÅÄÖ in input files.
\RequirePackage[utf8]{inputenc}

% To support the toc
\RequirePackage{tocloft}

% Allow setting headers and footers.
\RequirePackage{fancyhdr}

% Set the proper margins for the F-reglemente.
\RequirePackage[margin=1in]{geometry}

% Allow for inclusion of extrenal pdf-pages
\RequirePackage{pdfpages}

\RequirePackage{needspace}

\RequirePackage{enumitem}

%Natural numbers N
\RequirePackage{amssymb}

%\RequirePackage{hyperref}


%%% --------------------------------
%%% Global document settings
%%% --------------------------------

\setlength{\parskip}{1.5em}

%%% --------------------------------
%%% Enumerate settings
%%% --------------------------------

\renewcommand{\theenumi}{\alph{enumi}}

%%% --------------------------------
%%% Title page settings
%%% --------------------------------
\newcommand{\@tagna}{17 november 1994}

\newcommand{\tagna}[1]{
	\renewcommand{\@tagna}{#1}
}

\newcommand{\@revid}{\today}

\newcommand{\revid}[1]{
	\renewcommand{\@revid}{#1}
}

\renewcommand{\@title}{
\f-teknologsektionen inom TLTH	
}

\renewcommand{\maketitle}{
	\begin{titlepage}
		\vspace*{8em}
		\begin{center}
			\rule{\linewidth}{0.5mm} \\
			\vspace*{0.5em}
			\Large{\textbf{\@title}} \\
			\vspace*{0.5em}
			\Huge{\textbf{Reglemente}} \\
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
			\includegraphics[width=0.60\textwidth]{fsek.pdf}
			\vfill
		\end{center}
	\end{titlepage}
}

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

%%% --------------------------------
%%% Simple commands
%%% --------------------------------

% The F symbol command.
\newcommand{\f}{%
    \includegraphics[height=0.90em]{f.pdf}%
}

%%% --------------------------------
%%% The Table of Contents (The ToC)
%%% --------------------------------

% Sets the title of the ToC
\newcommand{\listkap}{Innehåll}

%Defines the ToC called kap and creates counter kapitel 
\newlistof{kapitel}{kap}{\listkap}

%Creates counter paragraf 
\newlistentry[kapitel]{paragraf}{kap}{1}

\newlistentry[kapitel]{subkap}{kap}{1}
\cftsetindents{subkap}{0em}{1.0em}

%Sets the indent for paragraf entries in the ToC 
%%% Changed from \cftsetindents{paragraf}{2.0em}{4.0em} / DD 20141223
\cftsetindents{paragraf}{2.0em}{4.0em}

%Creates counter subparagraf
\newlistentry[paragraf]{subparagraf}{kap}{2}

%Sets indent for subparagraf entries in the ToC
%---------- NOT IN USE-----------------------
%\cftsetindents{subparagraf}{1.5em}{3.0em}

\renewcommand{\theparagraf}{\S{} \thekapitel.\arabic{paragraf}}
\renewcommand{\thesubparagraf}{\S{} \thekapitel.\arabic{paragraf}.\arabic{subparagraf}}

%Sets the displaying depth. 
%-- 1 for displaying only chapters
%-- 2 for displaying only chapters and paragraphs
%-- 3 for displaying chapters, paragraphs and subparagraphs. 
\setcounter{kapdepth}{2}

%Simplifying commands from package default
\newcommand{\toc}{\listofkapitel}
\newcommand{\kapitel}{\thekapitel}
\newcommand{\paragraf}{\theparagraf}
\newcommand{\subparagraf}{\thesubparagraf}

%%% --------------------------------
%%% Section commands
%%% --------------------------------

% Defines the kapitel command
\newcommand{\kap}[1]{
	\noindent
    \par
    \medskip
	\refstepcounter{kapitel}
	\begin{minipage}[t]{0.30\textwidth}
		{\noindent\LARGE\textbf{Kapitel \kapitel}}
	\end{minipage}
	\begin{minipage}[t]{0.68\textwidth}
		{\LARGE\textbf{#1}}
	\end{minipage}
    \par
	\nopagebreak
	\addcontentsline{kap}{kapitel}{\protect\numberline{\kapitel}#1}
}

% Defines the kapitel command
\newcommand{\subkap}[1]{
	\noindent
    \par
    \medskip
	%\refstepcounter{kapitel}
	{\Large\textbf{#1}}
    \par
    \nopagebreak
	\addcontentsline{kap}{subkap}{\protect\numberline{}#1}
}

%Defines the paragraf command
%%% Changed from 0.08--0.23--0.68 /DD 20141223
\newcommand{\parg}[2]{
	\noindent
	\begin{minipage}[t]{0.1\textwidth}
		\refstepcounter{paragraf}
		\bfseries
		\paragraf
	\end{minipage}
	\begin{minipage}[t]{0.21\textwidth}
		\textit{\textbf{#1}}
	\end{minipage}
	\begin{minipage}[t]{0.68\textwidth}
		\setlength{\parskip}{0.7em}
		#2
	\end{minipage}
	\par
	\addcontentsline{kap}{paragraf}{\protect\numberline{\paragraf}#1}
}

%Defines the subparagraf command
%%%Changed from 0.1--0.2--0.68 /DD 20141223
\newcommand{\subparg}[2]{
	\noindent
	\begin{minipage}[t]{0.12\textwidth}
		\hspace*{0.05\textwidth}
		\refstepcounter{subparagraf}
		\subparagraf
	\end{minipage}
	\begin{minipage}[t]{0.18\textwidth}
		{\emph{#1}}
	\end{minipage}
	\begin{minipage}[t]{0.68\textwidth}
		\setlength{\parskip}{0.7em}
		{#2}
	\end{minipage}
    \par
}
\endinput