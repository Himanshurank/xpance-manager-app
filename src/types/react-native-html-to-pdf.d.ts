declare module 'react-native-html-to-pdf' {
  interface Options {
    html: string;
    fileName?: string;
    directory?: string;
  }

  interface PDFFile {
    filePath: string;
    base64?: string;
  }

  export default {
    convert(options: Options): Promise<PDFFile>;
  };
} 