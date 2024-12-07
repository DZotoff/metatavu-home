/**
 * Interface for CardImage component
 * 
 * @param src source URL of the image
 * @param alt text used when the image fails to load
 * @param onImageClick callback triggered when the image is clicked
 */
interface ImageProps {
  src: string;
  alt?: string;
  onImageClick?: (src: string) => void;
}

/**
 * CardImage component to display an image with interactive functionality
 */
const CardImage = ({ src, alt, onImageClick }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt || "Image"}
      style={{
        width: "100%",
        height: "auto",
        cursor: "pointer",
      }}
      onClick={() => onImageClick && onImageClick(src)}
    />
  );
};

export default CardImage;