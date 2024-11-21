import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useLambdasApi } from "src/hooks/use-api";
import { TrelloCard, TrelloMember } from "src/generated/homeLambdasClient";
import ReactMarkdown from "react-markdown";
import UserRoleUtils from "src/utils/user-role-utils";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"
import strings from "src/localization/strings";
import { useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";

/**
 * Card screen component
 */
const CardScreen = () => {
  const [cards, setCards] = useState<TrelloCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [members, setMembers] = useState<TrelloMember[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>();
  const [comment, setComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { trelloApi } = useLambdasApi();
  const adminMode = UserRoleUtils.adminMode();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    fetchCards();
  }, []);

  /**
   * Fetches Trello cards and board members
   */
  const fetchCards = async () => {
    setLoading(true);
    try {
      const cards = await trelloApi.listCards();
      const members = await trelloApi.getBoardMembersEmails();
      setMembers(members);
      setCards(cards);
      setFilteredCards(cards);
    } catch (error) {
      setError(`${strings.cardRequestError.errorFetchingCards}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Filters cards based on the user input in the filter field
   * 
   * @param event event
   */
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setFilterQuery(query);
    setFilteredCards(cards.filter((card) => card.title?.toLowerCase().includes(query)));
  };

  /**
   * Deletes a card by its ID
   * 
   * @param id card ID to delete
   */
  const deleteCard = async (id: string) => {
    try {
      const deleteCardResponse = await trelloApi.deleteCard({ id });
      if (deleteCardResponse.message === "Card deleted successfully") {
        const updatedCards = cards.filter((card) => card?.cardId !== id);
        const updatedFilteredCards = filteredCards.filter((card) => card?.cardId !== id);
        setCards(updatedCards);
        setFilteredCards(updatedFilteredCards);
      }
    } catch (error) {
      setError(`${strings.cardRequestError.errorDeletingCard}, ${error}`);
    }
  };
  
  /**
   * Creates a new card with the specified title and description
   */
  const createCard = async () => {
    try {
      const cardCreated = await trelloApi.createCard({ createCardRequest: {title: title, description: description} });
      if (cardCreated.cardId) {
        const newCard = {
          cardId: cardCreated.cardId,
          title: title,
          description: description,
          assignedPersons: [],
          comments: []
        }
        setCards([...cards, newCard]);
        if (cardCreated.title?.toLowerCase().includes(filterQuery)) 
          setFilteredCards([...filteredCards, newCard]);
      }
      setTitle("");
      setDescription("");
    } catch (error) {
      setError(`${strings.cardRequestError.errorCreatingCard}, ${error}`);
    }
  };

  /**
   * Adds a comment to the selected card
   */
  const createComment = async () => {
    if (selectedCard) {
      try {
        const newComment = {
          text: comment,
          createdBy: members[0].memberId // need to be replaced with the actual user
        };

        await trelloApi.createComment({
          createCommentRequest: { comment: newComment.text, cardId: selectedCard.cardId },
        });

        const updatedSelectedCard = {
          ...selectedCard,
          comments: [...selectedCard.comments, newComment],
        };

        const updatedCards = cards.map((card) =>
          card.cardId === selectedCard.cardId ? updatedSelectedCard : card
        );

        const updatedFilteredCards = filteredCards.map((card) =>
          card.cardId === selectedCard.cardId ? updatedSelectedCard : card
        );

        setSelectedCard(updatedSelectedCard);
        setCards(updatedCards);
        setFilteredCards(updatedFilteredCards);
        setComment("");
      } catch (error) {
        setError(`${strings.cardRequestError.errorAddingComment}, ${error}`);
      }
    }
  };

  /**
   * Opens the details dialog for a selected card
   * 
   * @param card Trello card
   */
  const openCard = (card: any) => {
    setIsDialogOpen(true);
    setSelectedCard(card);
  };

  /**
   * Closes the card details dialog
   */
  const closeCard = () => {
    setSelectedCard({});
    setIsDialogOpen(false);
  };

  /**
   * Opens a full-size image dialog for the specified image
   * 
   * @param src The source image UR
   */
  const openImage = (src: string) => {
    setSelectedImage(src);
    setIsImageOpen(true);
  };

  /**
   * Closes the image dialog
   */
  const closeImage = () => {
    setSelectedImage(null);
    setIsImageOpen(false);
  };

  /**
   * Renders an avatar for a specific member
   * 
   * @param memberId member ID
   */
  const AvatarIcon = ({memberId}:{memberId: string}) => {
    const assignedMember = members.find((m) => m.memberId === memberId);
  
    if (!assignedMember) {
      return null;
    }
    const { fullName } = assignedMember;
    const initials = fullName?.split(" ").map((word) => word[0]).join("").toUpperCase();
  
    return (
      <Tooltip title={fullName || `${strings.cardRequestError.unknownMember}`}>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: 35,
            height: 35,
            fontSize: "1rem",
          }}
        >
          {initials}
        </Avatar>
      </Tooltip>
    );
  };

  /**
   * Renders a grouped avatars for assigned members
   * 
   * @param memberIds The list of member IDs to display
   */
  const AvatarWrapper = ({ memberIds }: { memberIds: string[] }) => {
    const maxAvatars = 3;
    const hiddenMembers = memberIds.slice(maxAvatars - 1);

    return (
      <AvatarGroup max={maxAvatars} sx={{ justifyContent: "flex-end" }}>
        {memberIds.slice(0, maxAvatars - 1).map((id) => (
          <AvatarIcon key={id} memberId={id} />
        ))}
      {hiddenMembers.length > 0 && (
        <Tooltip
          title={
            <Box>
              {hiddenMembers
                .map(
                  (id) =>
                    members.find((member) => member.memberId === id)?.fullName || `${strings.cardRequestError.unknownMember}`
                )
                .map((name, index) => (
                  <div key={index}>
                    {name}
                  </div>
                ))}
          </Box>
          }
        >
          <Avatar
            sx={{
              bgcolor: "secondary.main",
              color: "white",
              width: 35,
              height: 35,
              fontSize: "0.8rem",
            }}
          >
            +{memberIds.length - (maxAvatars - 1)}
          </Avatar>
        </Tooltip>
      )}
      </AvatarGroup>
    );
  };
  
  return (
    <Box>
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6">{strings.cardScreen.createNewCard}</Typography>
        <TextField
          label={strings.cardScreen.title}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
          sx={{ mt: 1 }}
        />
        <TextField
          label={strings.cardScreen.description}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          rows={4}
          fullWidth
          sx={{ mt: 1 }}
        />
        <Button onClick={createCard} variant="contained" sx={{ mt: 1 }}>
          {strings.cardScreen.createCard}
        </Button>
      </Card>
      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          label={strings.cardScreen.filterCards}
          value={filterQuery}
          onChange={handleFilterChange}
          fullWidth
        />
      </Card>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: 2,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%"
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
        <>
          {filteredCards.map((card: any) => (
            <Card key={card.cardId} sx={{ 
              display: "flex", 
              flexDirection: "column", 
              height: "400px",
              position: "relative" 
            }}>
              <CardContent sx={{ flexGrow: 1, height: '40%' }}>
                <Typography variant="h6">{card.title}</Typography>
                <Box style={{height: '80%', overflow: 'hidden'}}>
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img {...props} style={{ width: "100%", height: "auto" }} alt={props.alt || "Image"} />
                      ),
                    }}
                  >
                    {card.description ? card.description : `${strings.cardRequestError.noDescription}`}
                  </ReactMarkdown>
                </Box>
              </CardContent>
              <CardActions sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 16px"
              }}>
                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Button onClick={() => openCard(card)} variant="outlined" sx={{ position: "relative", bottom: 0 }}>
                    {strings.cardScreen.open}
                  </Button>
                  {!adminMode && (
                    <Button onClick={() => deleteCard(card.cardId)} variant="outlined" color="error">
                      {strings.cardScreen.delete}
                    </Button>
                  )}
                </Box>
                <Box
                  sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                >
                  <Tooltip title={card.comments.length > 0 ?
                    <Box>
                      {card.comments?.reduce((sum: any, comment: any) => {
                        const author = members.find(member => member.memberId === comment.createdBy)?.fullName || '';
                        const existing = sum.find((item: any) => item.includes(author));
                        if (existing) {
                          const count = parseInt(existing.split(" ")[0]) + 1;
                          sum = sum.filter((item: any) => !item.includes(author));
                          sum.push(
                            count > 1
                              ? strings.cardScreen.messagesFrom
                                .replace("{count}", count.toString())
                                .replace("{author}", author)
                              : strings.cardScreen.messageFrom
                                .replace("{count}", "1")
                                .replace("{author}", author)
                          );
                        } else {
                          sum.push(
                            strings.cardScreen.messageFrom
                              .replace("{count}", "1")
                              .replace("{author}", author)
                          );
                        }
                        return sum;
                      }, [])
                        .map((text: any, index: any) => (
                          <div key={index}>{text}</div>
                        )) || <div>{strings.cardRequestError.noComments}</div>}
                    </Box>
                    : ""
                  }>
                    <IconButton>
                      <Badge
                        badgeContent={card.comments?.length || 0}
                        color="primary"
                        overlap="circular"
                      >
                        <ChatBubbleOutlineIcon />
                      </Badge>
                    </IconButton> 
                  </Tooltip>
                </Box>
                <AvatarWrapper memberIds={card.assignedPersons} />
              </CardActions>
            </Card>
          ))}
        </>
      )}
      </Box>
      <Box>
        {selectedCard && (
          <Dialog 
            open={isDialogOpen} 
            onClose={closeCard} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>{selectedCard.title}</DialogTitle>
            <DialogContent>
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      style={{ 
                        width: "100%", 
                        height: "auto", 
                        cursor: "pointer" 
                      }}
                      alt={props.alt || "Image"}
                      onClick={() => openImage(props.src || "")}
                    />
                  ),
                }}
              >
                {selectedCard.description}
              </ReactMarkdown>
              <Box>
                <Typography variant="subtitle1">{strings.cardScreen.comments}:</Typography>
                {selectedCard?.comments?.map((comment: any, index: any) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    sx={{ pl: 2 }}
                  >
                    - {comment.text || `${strings.cardRequestError.noText}`} ({members.find(member => member.memberId === comment.createdBy)?.fullName || `${strings.cardRequestError.unknownAuthor}`} -{" "}
                    {members.find(member => member.memberId === comment.createdBy)?.email || `${strings.cardRequestError.noEmail}`})
                  </Typography>
                ))}
              </Box>
              <TextField
                label={strings.cardScreen.addComment}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                fullWidth
                sx={{ mt: 1 }}
              />
              <Button onClick={createComment} variant="contained" sx={{ mt: 1 }}>
                {strings.cardScreen.addComment}
              </Button>
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={isImageOpen} onClose={closeImage} maxWidth="lg" fullWidth>
          <DialogContent>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              alignItems: "flex-end" 
            }}>
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Full Size"
                  style={{ 
                    width: "100%", 
                    height: "auto", 
                    objectFit: "contain", 
                    marginTop: "16px" 
                  }}
                />
              ) : (
                <Typography>{strings.cardRequestError.noImage}</Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeImage} color="primary">
              {strings.cardScreen.close}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CardScreen;