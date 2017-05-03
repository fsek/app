\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{fclass}[2012/09/18 Fclass]

%%% Den tredje stora F-klassen(TM)
%%% Av Johan Förberg F10, 2012--2013
%%% Redigerad av Linus Hammarlund Pi10, 2013
%%% Redigerad av Daniel Damberg F12, 2015

%% Load the article class and Latex.
\LoadClass[10pt, a4paper]{article}

%%% Requires

\RequirePackage{lmodern}
% Set Latin Modern ss the default serif.
\RequirePackage{helvet}
% Set Helvetica as the default sans-serif.
\RequirePackage{graphicx}
% Get images so we can put the F f in flowing text.
\RequirePackage[swedish]{babel}
% Get Swedish dates and standard strings.
\RequirePackage[utf8]{inputenc}
% Allow unicode åäö in input files.
\RequirePackage{lastpage}
% Get a reference to the last page.
\RequirePackage{titlesec}
% Allow changing section styles.
\RequirePackage{fancyhdr}
% Allow setting headers and footers.
\RequirePackage[top=20mm, right=30mm, bottom=30mm, left=20mm]{geometry}
% Set the proper margins for the F paper.
\RequirePackage{wallpaper}
% Allow us to include the F paper digitally as a background.
\RequirePackage{multicol}
% Allow multi-column layouts.
\RequirePackage{tabularx}
% Allow more sleek tables
\RequirePackage{framed}
% Get frames around boxes
\RequirePackage{pdfpages}
% Allow for inclusion of external pdf-pages
\RequirePackage[T1]{fontenc}
% Sets the proper font encoding for the document


%%% --------------------------------
%%% Class options
%%% --------------------------------

% Include the F letterhead digitally in the PDF? (use sparingly)
\DeclareOption{nofpaper}{
	\ULCornerWallPaper{1}{fpapper.pdf}
}

% Reduce spacing between paragraphs and stop nopagebreaking
\DeclareOption{dagordning}{\AtEndOfClass{
	\setlength{\pgspacebefore}{0pt}
	\renewcommand{\nopagebreakafterparagraph}{}
}}

% Change indention style of the document
\DeclareOption{protokoll}{\AtEndOfClass{
	% Make the paragraph s indented nicely
	\newgeometry{left={20mm}+\pgnumberwidth}	
	\setlength{\lheadoffset}{-\pgnumberwidth}
	\setlength{\firstpagevoffset}{-20mm}
	
	% Hack header rule
	\newbox\FHline
	\setbox\FHline=\hbox{\hsize=\paperwidth%
  		\hspace*{\lheadoffset}%
  		\rule{\dimexpr\headwidth\relax}{\headrulewidth}%
	}
	\renewcommand\headrule{\vskip-.7\baselineskip\copy\FHline}
}}
	
\ProcessOptions\relax



%%% --------------------------------
%%% Defaults
%%% --------------------------------
\def\@author {\f -sektionens styrelse}
\def\@shorttitle {}
\def\@type {Proposition}



%%% --------------------------------
%%% Global document settings
%%% --------------------------------
\newlength\pgnumberwidth
\setlength{\pgnumberwidth}{12mm}

\newlength\lheadoffset
\setlength{\lheadoffset}{0mm}

\newlength\firstpagevoffset
\setlength{\firstpagevoffset}{0mm}

\newlength\pgspacebefore
\setlength{\pgspacebefore}{1.2em}

\newlength\spaceaftertable
\setlength{\spaceaftertable}{1.2em}

\setlength{\parindent}{0mm}
\setlength{\parskip}{0.6em}

\setlength{\headheight}{5mm}
\setlength{\headsep}{5mm}

\setlength{\columnseprule}{0.5pt}%
\setlength{\columnsep}{10mm}%

% The get total number of pages command. You must compile the document
% TWICE or you will get the WRONG number of pages.
\newcommand{\pagecount}{\pageref{LastPage}}

% Set the headers.
\pagestyle{fancy}
\lhead{
	\hspace*{\lheadoffset}%
	\textsc{\@type}: \textsl{\@shorttitle}
}
\chead{}
\rhead{
	Sida \thepage\ av \pagecount%
	\hspace*{-\lheadoffset}
}
\lfoot{}
\cfoot{}
\rfoot{}

% Section headings in sans-serif.
\titleformat{\section}{\Large\sffamily}{\thesection}{1em}{}
\titleformat{\subsection}{\large\sffamily}{\thesubsection}{1em}{}
\titleformat{\subsubsection}{\sffamily}{\thesubsubsection}{1em}{}



%%% --------------------------------
%%% Simple commands
%%% --------------------------------

% Setters for document variables.
\newcommand{\shorttitle}[1]{
    \def\@shorttitle{#1}
}

\newcommand{\type}[1]{
    \def\@type{#1}
}

% The F symbol command.
\newcommand{\f}{%
    \includegraphics[height=0.90em]{f.pdf}%
}

% The E symbol command.
\newcommand{\esek}{%
    \includegraphics[height=0.90em]{e.pdf}%
}

% The M symbol command.
\newcommand{\msek}{%
    \includegraphics[height=0.90em]{m.pdf}%
}

% The V symbol command.
\newcommand{\vsek}{%
    \includegraphics[height=0.90em]{v.pdf}%
}

% The a symbol command.
\newcommand{\asek}{%
    \includegraphics[height=0.90em]{a.pdf}%
}

% The k symbol command.
\newcommand{\ksek}{%
    \includegraphics[height=0.90em]{k.pdf}%
}

% The d symbol command.
\newcommand{\dsek}{%
    \includegraphics[height=0.90em]{d.pdf}%
}

% The ING symbol command.
\newcommand{\ingsek}{%
    \includegraphics[height=0.90em]{ing.pdf}%
}

% The W symbol command.
\newcommand{\wsek}{%
    \includegraphics[height=0.90em]{w.pdf}%
}

% The I symbol command.
\newcommand{\isek}{%
    \includegraphics[height=0.90em]{i.pdf}%
}

% The TLTH symbol command.
\newcommand{\tlth}{%
    \includegraphics[height=0.90em]{tlth.pdf}%
}

% The AF symbol command.
\newcommand{\af}{%
    \includegraphics[height=0.90em]{af.pdf}%
}

% The att environment.
\newenvironment{att} 
{ % begin

	% Whitespace line above
    \begin{minipage}[t]{0.1\linewidth}%
        \hspace{0.35\linewidth}\textit{att}%
    \end{minipage}%
    \begin{minipage}[t]{0.9\linewidth}%
}
{ % end
    \end{minipage}%

}

\newcommand{\batt}{\begin{att}}
\newcommand{\eatt}{\end{att}}

\newcommand{\nopagebreakafterparagraph}{\nopagebreak}


%%% --------------------------------
%%% Table environments
%%% --------------------------------
\newcolumntype{D}{>{\raggedright\arraybackslash}m{0.12\textwidth}<{}} %date
\newcolumntype{P}{>{\raggedright\arraybackslash}m{0.25\textwidth}<{}} %person
\newcolumntype{T}{>{\raggedright\arraybackslash}m{0.35\textwidth}<{}} %title

% The workgroup tracker environment
\newenvironment{arb}
{%
	\tabularx{\textwidth}{DTPD}
	\sffamily Tillsatt&
    	\sffamily Arbetsgrupp&
    	\sffamily Sammankallande&
    	\sffamily Redovisning\\
    	\hline \hline
}
{%
	\endtabularx%
	\vspace*{\spaceaftertable}%
	
}

% The decision history environment.
\newenvironment{beslutsupf}
{%
	\tabularx{\textwidth}{DTPD}
    		\sffamily Taget&
    		\sffamily Beslut&
    		\sffamily Ansvarig&
    		\sffamily Redovisning\\
    		\hline \hline
}
{%
	\endtabularx%
	\vspace*{\spaceaftertable}%
	
}



%%% --------------------------------
% The present members environment.
%%% --------------------------------
\newenvironment{narvaro}
{%
	\begin{multicols}{3}%
	\raggedright%
}
{%
	\end{multicols}%
	\vspace{-3mm}%
}



%%% --------------------------------
% The block of signatures environment.
%%% --------------------------------
\newenvironment{signblock}
{%
	\vfill%
	\begin{samepage}%
}
{%
	\end{samepage}%
}

% The signature command and counter.
\newcounter{signature}
\newcommand{\sign}[2][]{%
    \refstepcounter{signature}%
    % Om udda, bryt raden.
    \ifodd\value{signature}
        {\nopagebreak\par
         \nopagebreak\vspace{16mm}}
    \fi
    \begin{minipage}[t]{0.5\linewidth}
        \rule{0.8\textwidth}{0.5pt}
        \nopagebreak\par
        #2 \\* \emph{#1}
    \end{minipage}
}



%%% --------------------------------
% Paragraphs
%%% --------------------------------

% Reference counters
\newcounter{para}
\newcounter{subpara}[para]

\newcommand{\refparacounter}{
	\refstepcounter{para}%
  	\textsf{\S\ \arabic{para}}%
}

\newcommand{\refsubparacounter}{
	\refstepcounter{subpara}%
  	\textsf{\S\ \arabic{para}.\arabic{subpara}}%
}



% The paragraph command with following text
\newcommand{\parawithparathesis}[3]{%
	\vspace{\pgspacebefore}%
	\hspace*{\lheadoffset}%
	\begin{minipage}[t]{\pgnumberwidth}%
		{#3}
	\end{minipage}%
	\begin{minipage}[t]{\textwidth-\pgnumberwidth-\lheadoffset}%
		\textsf{{#1}\hfill\emph{#2}}%
	\end{minipage}%

	%Note whitespace above
	\nopagebreakafterparagraph
}

%Note the whitelines
\newcommand{\pg}[1]{\parawithparathesis{#1}{\phantom}{\refparacounter}}
\newcommand{\para}[1]{\pg{#1}}

\newcommand{\beslut}[1]{\parawithparathesis{#1}{(Beslut)}{\refparacounter}}
\newcommand{\info}[1]{\parawithparathesis{#1}{(Information)}{\refparacounter}}
\newcommand{\diskussion}[1]{\parawithparathesis{#1}{(Diskussion)}{\refparacounter}}

% Subparagraphs
\newcommand{\subpg}[1]{\parawithparathesis{#1}{\phantom}{\refsubparacounter}}
\newcommand{\subpara}[1]{\subpg{#1}}



%%% --------------------------------
% Special boxes
%%% --------------------------------
\newenvironment{specialbox}[1]
{ % begin
    \hspace{0.05\textwidth}%
	\begin{minipage}[t]{0.9\textwidth}%
	\begin{framed}
		\emph{\textbf{#1}}\\
		\setlength{\parskip}{0.7em}
}
{ % end
	\end{framed}
    \end{minipage}%

}



%%% --------------------------------
%%% Last/First page
%%% --------------------------------
\AtBeginDocument{
    \vspace*{\firstpagevoffset}%
    \thispagestyle{empty}%
    \hspace*{\lheadoffset}%
    \begin{minipage}[t]{0.4\linewidth}
        \textsc{\@type}
        %
        %\textit{\@shorttitle}
        %
        %Sida \thepage\ av \pagecount
    \end{minipage}
    \hfill
    \begin{minipage}[t]{0.4\linewidth}
        \begin{flushright}
            \@author

            \@date
        \end{flushright}
    \end{minipage}%

    \vspace{10mm}%

	\begin{minipage}[c]{\lheadoffset+\textwidth}
    		\begin{center}%
        		\LARGE{\textsf{\@title}}%
    		\end{center}%
    	\end{minipage}
    \vspace{6mm}%
}

\AtEndDocument{
}
