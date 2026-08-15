"use client";
import React, { useState } from "react";

export interface FileTreeItem {
  name: string;
  type: "folder" | "file";
  fullPath?: string;
  icon?: React.ComponentType;
  children?: FileTreeItem[];
}

interface FolderIconProps {
  isOpen: boolean;
}

interface ChevronIconProps {
  isOpen: boolean;
}

interface TreeIconProps {
  item: FileTreeItem;
  isOpen: boolean;
}

interface TreeNodeProps {
  item: FileTreeItem;
  selectedFile: string;
  onFileSelect: (filePath: string) => void;
}

export const FileIcon = () => (
  <svg
    className="w-4 h-4 mr-1.5 text-zinc-400 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

export const JsIcon = () => (
  <svg
    className="w-4 h-4 mr-1.5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
    <path
      fill="none"
      stroke="#000001"
      strokeMiterlimit="10"
      strokeWidth="3.3"
      d="M23.783,22.352v9.819 c0,3.764-4.38,4.022-6.283,0.802"
    ></path>
    <path
      fill="none"
      stroke="#000001"
      strokeMiterlimit="10"
      strokeWidth="3.3"
      d="M34.69,25.343 c-1.739-2.727-5.674-2.345-5.84,0.558c-0.214,3.757,6.768,2.938,6.247,7.107c-0.365,2.92-4.874,3.858-7.193-0.065"
    ></path>
  </svg>
);

export const HtmlIcon = () => (
  <svg
    className="w-4 h-4 mr-1.5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path fill="#E65100" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"></path>
    <path fill="#FF6D00" d="M24 8L24 39.9 35.2 36.7 37.7 8z"></path>
    <path
      fill="#FFF"
      d="M24,25v-4h8.6l-0.7,11.5L24,35.1v-4.2l4.1-1.4l0.3-4.5H24z M32.9,17l0.3-4H24v4H32.9z"
    ></path>
    <path
      fill="#EEE"
      d="M24,30.9v4.2l-7.9-2.6L15.7,27h4l0.2,2.5L24,30.9z M19.1,17H24v-4h-9.1l0.7,12H24v-4h-4.6L19.1,17z"
    ></path>
  </svg>
);

export const CssIcon = () => (
  <svg
    className="w-4 h-4 mr-1.5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path fill="#0277BD" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"></path>
    <path fill="#039BE5" d="M24 8L24 39.9 35.2 36.7 37.7 8z"></path>
    <path
      fill="#FFF"
      d="M33.1 13L24 13 24 17 28.9 17 28.6 21 24 21 24 25 28.4 25 28.1 29.5 24 30.9 24 35.1 31.9 32.5 32.6 21 32.6 21z"
    ></path>
    <path
      fill="#EEE"
      d="M24,13v4h-8.9l-0.3-4H24z M19.4,21l0.2,4H24v-4H19.4z M19.8,27h-4l0.3,5.5l7.9,2.6v-4.2l-4.1-1.4L19.8,27z"
    ></path>
  </svg>
);

export const ReactIcon = () => (
  <svg
    className="w-4 h-4 mr-1.5 text-cyan-400 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <g>
      <ellipse
        cx="12"
        cy="12"
        rx="11"
        ry="4.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="11"
        ry="4.2"
        transform="rotate(60 12 12)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="11"
        ry="4.2"
        transform="rotate(120 12 12)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </g>
  </svg>
);

export const FolderIcon: React.FC<FolderIconProps> = ({ isOpen }) => (
  <svg
    className="w-4 h-4 mr-1.5 text-amber-400 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {isOpen ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    )}
  </svg>
);

export const ChevronIcon: React.FC<ChevronIconProps> = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`}
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export const TreeIcon: React.FC<TreeIconProps> = ({ item, isOpen }) => {
  if (item.icon) {
    const IconComponent = item.icon;
    return <IconComponent />;
  }
  if (item.type === "folder") {
    return <FolderIcon isOpen={isOpen} />;
  }
  const name = item.name.toLowerCase();
  if (name.endsWith(".jsx") || name.endsWith(".tsx")) return <ReactIcon />;
  if (name.endsWith(".js") || name.endsWith(".ts")) return <JsIcon />;
  if (name.endsWith(".html")) return <HtmlIcon />;
  if (name.endsWith(".css")) return <CssIcon />;

  return <FileIcon />;
};

export const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  selectedFile,
  onFileSelect,
}) => {
  const isFolder = item.type === "folder";
  const [isOpen, setIsOpen] = useState(true);

  const targetPath = item.fullPath || item.name;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(targetPath);
    }
  };

  const isSelected =
    !isFolder &&
    (selectedFile === targetPath ||
      selectedFile === "/" + targetPath ||
      targetPath === "/" + selectedFile);

  return (
    <div className="text-foreground relative select-none">
      <button
        className={`w-full text-left flex items-center py-1.5 px-2.5 rounded-none cursor-pointer transition-colors text-xs font-mono ${
          isSelected
            ? "bg-primary/10 text-primary font-semibold border-l-2 border-l-primary border-y-0 border-r-0"
            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleToggle}
        aria-expanded={isFolder ? isOpen : undefined}
      >
        <div className="flex items-center grow min-w-0">
          {isFolder ? (
            <ChevronIcon isOpen={isOpen} />
          ) : (
            <div className="w-3.5 shrink-0" />
          )}
          <div className="flex items-center ml-1 truncate">
            <TreeIcon item={item} isOpen={isOpen} />
            <span className="text-xs ml-1 truncate">{item.name}</span>
          </div>
        </div>
      </button>

      {isFolder && isOpen && item.children && (
        <div className="pl-3.5 relative overflow-hidden transition-all duration-200">
          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border/60" />
          {item.children.map((child: FileTreeItem) => (
            <TreeNode
              key={child.fullPath || child.name}
              item={child}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function buildFileTree(filePaths: string[]): FileTreeItem[] {
  const root: FileTreeItem[] = [];

  filePaths.forEach((path) => {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const parts = cleanPath.split("/");

    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          type: isFile ? "file" : "folder",
          fullPath: path,
          children: isFile ? undefined : [],
        };
        currentLevel.push(existingNode);
      }

      if (!isFile && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });

  return root;
}

export interface ProjectFileTreeProps {
  fileList: string[];
  selectedFile: string;
  onFileSelect: (filePath: string) => void;
}

export default function ProjectFileTree({
  fileList,
  selectedFile,
  onFileSelect,
}: ProjectFileTreeProps) {
  const treeData = React.useMemo(
    () => buildFileTree(fileList),
    [fileList]
  );

  return (
    <div className="font-mono p-2 space-y-0.5 custom-scrollbar">
      {treeData.map((item) => (
        <TreeNode
          key={item.fullPath || item.name}
          item={item}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}
